// Webhook configuration
const WEBHOOK_URL = 'https://n8n.srv1206045.hstgr.cloud/webhook-test/c34485cb-630c-4674-b9bf-849f74691421';
 
// Function to collect all form data
function collectFormData() {
  const formData = {};
  
  // Get all input fields (excluding radios, handle separately)
  const inputs = document.querySelectorAll('#closed_deal input:not([type="radio"]), #closed_deal select');
  inputs.forEach(field => {
    if (field.id && field.value) {
      formData[field.id] = field.value;
    }
  });
  
  // Handle radio buttons
  const radios = document.querySelectorAll('#closed_deal input[type="radio"]:checked');
  radios.forEach(radio => {
    formData[radio.name] = radio.value;
  });
  
  return formData;
}

// Function to send data to webhook
async function sendToWebhook(data) {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Webhook response:', result);
    return result;
  } catch (error) {
    console.error('Error sending data to webhook:', error);
    throw error;
  }
}

// Function to submit form data
async function submitFormData() {
  const formData = collectFormData();
  
  if (Object.keys(formData).length === 0) {
    console.warn('No form data to submit');
    return false;
  }

  try {
    await sendToWebhook(formData);
    console.log('Form data sent successfully');
    return true;
  } catch (error) {
    console.error('Failed to submit form data:', error);
    return false;
  }
}
