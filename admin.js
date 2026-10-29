(() => {
  const form = document.getElementById('gallery-admin-form');
  const button = document.getElementById('publish-button');
  const statusBox = document.getElementById('admin-status');
  const apiBase = 'https://api.github.com';
  const dataPath = 'collabs.json';

  function setStatus(message, type = '') {
    statusBox.textContent = message;
    statusBox.className = `admin-status show ${type}`;
  }
  function utf8ToBase64(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  }
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(new Error('Could not read that image file.'));
      reader.readAsDataURL(file);
    });
  }
  function apiPath(path) {
    return path.split('/').map(encodeURIComponent).join('/');
  }
  async function githubRequest(url, token, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {})
      }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) throw new Error('GitHub rejected the token. Check that it is correct and has not expired.');
      if (response.status === 403) throw new Error('GitHub denied access. Make sure the token has Contents: Read and write permission for this repository.');
      if (response.status === 404) throw new Error('Repository or collabs.json not found. Check the owner/repository name, branch, and that the current site files are uploaded.');
      throw new Error(body.message || `GitHub request failed (${response.status}).`);
    }
    return body;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const repo = document.getElementById('repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\.git$/, '');
    const branch = document.getElementById('branch').value.trim();
    const token = document.getElementById('token').value.trim();
    const file = document.getElementById('photo').files[0];
    const caption = document.getElementById('caption').value.trim();
    const alt = document.getElementById('alt').value.trim() || caption;
    if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
      setStatus('Enter the repository as owner/name, for example yourname/mayank-website.', 'error');
      return;
    }
    if (!file || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setStatus('Choose a JPG, PNG or WebP image.', 'error');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setStatus('This image is larger than 8 MB. Please resize or compress it before uploading.', 'error');
      return;
    }

    button.disabled = true;
    button.textContent = 'Uploading… please keep this tab open';
    setStatus('Connecting to GitHub…');
    try {
      const repoApi = `${apiBase}/repos/${repo}`;
      const branchInfo = await githubRequest(`${repoApi}/branches/${encodeURIComponent(branch)}`, token);
      const safeName = file.name.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'gallery-photo';
      const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
      const stem = safeName.replace(/\.[^.]+$/, '').slice(0, 70) || 'gallery-photo';
      const uniqueName = `${stem}-${Date.now()}.${extension}`;
      const imagePath = `assets/images/collabs/${uniqueName}`;
      const base64Image = await fileToBase64(file);

      setStatus('Uploading the photo to the repository…');
      await githubRequest(`${repoApi}/contents/${apiPath(imagePath)}`, token, {
        method: 'PUT',
        body: JSON.stringify({
          message: `Add gallery photo: ${caption.slice(0, 60)}`,
          content: base64Image,
          branch
        })
      });

      setStatus('Photo uploaded. Updating the gallery list…');
      let currentItems = [];
      let jsonSha;
      try {
        const existing = await githubRequest(`${repoApi}/contents/${apiPath(dataPath)}?ref=${encodeURIComponent(branch)}`, token);
        jsonSha = existing.sha;
        const binary = atob((existing.content || '').replace(/\n/g, ''));
        const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
        currentItems = JSON.parse(new TextDecoder().decode(bytes));
        if (!Array.isArray(currentItems)) throw new Error('collabs.json must contain a list of photos.');
      } catch (error) {
        if (!String(error.message).includes('not found')) throw error;
      }
      currentItems.push({ image: imagePath, caption, alt });
      const jsonPayload = {
        message: `Update Shared the Stage gallery: ${caption.slice(0, 60)}`,
        content: utf8ToBase64(JSON.stringify(currentItems, null, 2) + '\n'),
        branch
      };
      if (jsonSha) jsonPayload.sha = jsonSha;
      await githubRequest(`${repoApi}/contents/${apiPath(dataPath)}`, token, {
        method: 'PUT',
        body: JSON.stringify(jsonPayload)
      });

      setStatus('Published! The image and caption are committed to GitHub. Cloudflare Pages should deploy the update automatically in a minute or two. Refresh the live site after the deployment finishes.', 'success');
      form.reset();
      document.getElementById('branch').value = branch;
      document.getElementById('repo').value = repo;
      document.getElementById('token').value = '';
    } catch (error) {
      setStatus(`${error.message} If the photo uploaded but the gallery update failed, check GitHub before retrying to avoid duplicate files.`, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Upload & publish to gallery ↗';
    }
  });
})();
