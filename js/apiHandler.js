// js/apiHandler.js - FIXED VERSION (Global functions)
const API_BASE_URL = 'https://studybuddy-backend-bvio.onrender.com';   

/* ---------- Academic bot ---------- */
async function sendAcademicMessage(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/academic/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json.response;
  } catch (err) {
    console.error('Academic API error:', err);
    throw err;
  }
}

/* ---------- Mental-health bot ---------- */
async function sendMentalMessage(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mental/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json.response;
  } catch (err) {
    console.error('Mental API error:', err);
    throw err;
  }
}

/* ---------- Shared file upload ---------- */
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}