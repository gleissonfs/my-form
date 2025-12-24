// Form Steps Manager
class FormStepsManager {
  constructor() {
    this.steps = ['contact_info', 'service_info', 'payment_info', 'summary_info'];
    this.currentStep = 0;
    this.progressBar = document.querySelector('.tf-progress > div');
    this.init();
  }

  init() {
    // Set initial progress
    this.updateProgress();
    
    // Add event listeners to ALL next buttons (not back buttons or clear button)
    // Get all buttons that are NOT .tf-back and NOT .tf-clear
    const nextButtons = document.querySelectorAll('#closed_deal button[type="button"]:not(.tf-back):not(.tf-clear)');
    nextButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.nextStep();
      });
    });

    // Add event listener to back buttons
    const backButtons = document.querySelectorAll('.tf-back');
    backButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.prevStep();
      });
    });

    // Add submit button listener
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.addEventListener('click', (e) => {
        this.submitForm(e);
      });
    }

    // Add clear button listener (resets entire form)
    const clearButton = document.querySelector('button.tf-clear');
    if (clearButton) {
      clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.resetForm();
      });
    }

    // Add radio button change listeners for conditional field visibility
    const radioButtons = document.querySelectorAll('input[name="cliente_tipo"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        this.updateFieldVisibility();
      });
    });

    // Initialize field visibility
    this.updateFieldVisibility();

    // Attach input masks (apply as user types)
    const cpfEl = document.getElementById('cpf');
    if (cpfEl) cpfEl.addEventListener('input', () => MascaraCPF(cpfEl));

    const cnpjEl = document.getElementById('cnpj');
    if (cnpjEl) cnpjEl.addEventListener('input', () => MascaraCNPJ(cnpjEl));

    const zipEl = document.getElementById('zip_code');
    if (zipEl) zipEl.addEventListener('input', () => MascaraCep(zipEl));

    // Attach capitalization mask to inputs with class 'capitalize'
    const capitalizeInputs = document.querySelectorAll('input.capitalize');
    capitalizeInputs.forEach(input => {
      input.addEventListener('input', () => capitalizeWords(input));
    });
  }

  updateFieldVisibility() {
    const clienteType = document.querySelector('input[name="cliente_tipo"]:checked')?.value;
    const cnpjLabel = document.querySelector('label[for="cnpj"]');
    const cnpjInput = document.querySelector('input#cnpj');
    const businessNameLabel = document.querySelector('label[for="business_name"]');
    const businessNameInput = document.querySelector('input#business_name');

    if (clienteType === '282d3766-260f-4358-9e3d-fe5495df0239') {
      // Hide CNPJ and Business Name fields for individual clients
      if (cnpjLabel) cnpjLabel.style.display = 'none';
      if (cnpjInput) cnpjInput.style.display = 'none';
      if (businessNameLabel) businessNameLabel.style.display = 'none';
      if (businessNameInput) businessNameInput.style.display = 'none';
      
      // Remove required attribute if hidden
      if (cnpjInput) cnpjInput.removeAttribute('required');
      if (businessNameInput) businessNameInput.removeAttribute('required');
    } else {
      // Show CNPJ and Business Name fields for corporate clients
      if (cnpjLabel) cnpjLabel.style.display = 'block';
      if (cnpjInput) cnpjInput.style.display = 'block';
      if (businessNameLabel) businessNameLabel.style.display = 'block';
      if (businessNameInput) businessNameInput.style.display = 'block';
      
      // Add required attribute when visible
      if (cnpjInput) cnpjInput.setAttribute('required', 'required');
      if (businessNameInput) businessNameInput.setAttribute('required', 'required');
    }
  }

  validateStep(stepIndex) {
    const stepId = this.steps[stepIndex];
    const stepElement = document.getElementById(stepId);
    
    // Get all required inputs in this step
    const requiredInputs = stepElement.querySelectorAll('[required]');
    let isValid = true;

    requiredInputs.forEach(input => {
      // Skip hidden inputs
      if (input.style.display === 'none') {
        return;
      }

      // Check if input is empty
      if (!input.value.trim()) {
        isValid = false;
        input.style.borderColor = 'rgba(239,68,68,.5)';
        input.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,.2), 0 0 0 4px rgba(239,68,68,.15)';
      } else {
        input.style.borderColor = '';
        input.style.boxShadow = '';
      }
    });

    // Check radio buttons in this step (like cliente_tipo)
    const radioGroups = {};
    stepElement.querySelectorAll('input[type="radio"]').forEach(radio => {
      if (!radioGroups[radio.name]) {
        radioGroups[radio.name] = false;
      }
      if (radio.checked) {
        radioGroups[radio.name] = true;
      }
    });

    // Verify at least one radio button per group is selected
    for (const groupName in radioGroups) {
      if (!radioGroups[groupName]) {
        isValid = false;
      }
    }

    return isValid;
  }

  nextStep() {
    // Validate current step before advancing
    if (!this.validateStep(this.currentStep)) {
      // Add shake animation to indicate error
      const currentElement = document.getElementById(this.steps[this.currentStep]);
      currentElement.classList.add('tf-shake');
      setTimeout(() => {
        currentElement.classList.remove('tf-shake');
      }, 280);
      return; // Don't advance
    }

    if (this.currentStep < this.steps.length - 1) {
      const currentElement = document.getElementById(this.steps[this.currentStep]);
      
      // Add exit animation
      currentElement.classList.remove('active');
      currentElement.classList.add('exit');

      // Wait for exit animation to complete
      setTimeout(() => {
        currentElement.classList.remove('exit');
        currentElement.style.display = 'none';
        
        // Move to next step
        this.currentStep++;
        const nextElement = document.getElementById(this.steps[this.currentStep]);
        nextElement.style.display = 'flex';
        
        // Trigger reflow to restart animation
        void nextElement.offsetWidth;
        nextElement.classList.add('active');
        
        // If moving to summary step, populate it
        if (this.currentStep === this.steps.length - 1) {
          this.populateSummary();
        }
        
        this.updateProgress();
      }, 400);
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      const currentElement = document.getElementById(this.steps[this.currentStep]);
      
      // Add exit animation
      currentElement.classList.remove('active');
      currentElement.classList.add('exit');

      setTimeout(() => {
        currentElement.classList.remove('exit');
        currentElement.style.display = 'none';
        
        // Move to previous step
        this.currentStep--;
        const prevElement = document.getElementById(this.steps[this.currentStep]);
        prevElement.style.display = 'flex';
        
        // Trigger reflow to restart animation
        void prevElement.offsetWidth;
        prevElement.classList.add('active');
        
        this.updateProgress();
      }, 400);
    }
  }

  updateProgress() {
    const progress = ((this.currentStep + 1) / this.steps.length) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = progress + '%';
    }
  }

  populateSummary() {
    const summaryContent = document.getElementById('summary_content');
    const form = document.getElementById('closed_deal');
    
    let summaryHTML = '';
    
    // Contact Info Section
    summaryHTML += '<div class="summary-section">';
    summaryHTML += '<div class="summary-header">';
    summaryHTML += '<h3>Informações de Contato</h3>';
    summaryHTML += '<button class="summary-edit-btn" data-step="0" type="button">Editar</button>';
    summaryHTML += '</div>';
    const clienteType = document.querySelector('input[name="cliente_tipo"]:checked').value;
    summaryHTML += `<p><strong>Tipo de Cliente:</strong> <span>${clienteType === 'juridica' ? 'Jurídica' : 'Física'}</span></p>`;
    
    const responsible = document.getElementById('responsible').value;
    summaryHTML += `<p><strong>Responsável Legal:</strong> <span>${responsible}</span></p>`;
    
    const cpf = document.getElementById('cpf').value;
    summaryHTML += `<p><strong>CPF:</strong> <span>${cpf}</span></p>`;
    
    const rg = document.getElementById('rg').value;
    summaryHTML += `<p><strong>RG:</strong> <span>${rg}</span></p>`;
    summaryHTML += '</div>';
    
    // Service Info Section
    summaryHTML += '<div class="summary-section">';
    summaryHTML += '<div class="summary-header">';
    summaryHTML += '<h3>Informações da Loja</h3>';
    summaryHTML += '<button class="summary-edit-btn" data-step="1" type="button">Editar</button>';
    summaryHTML += '</div>';
    
    const storeName = document.getElementById('store_name').value;
    summaryHTML += `<p><strong>Nome da Loja:</strong> <span>${storeName}</span></p>`;
    
    // Only show CNPJ and Business Name if not fisica
    if (clienteType === 'juridica') {
      const cnpj = document.getElementById('cnpj').value;
      summaryHTML += `<p><strong>CNPJ:</strong> <span>${cnpj}</span></p>`;
      
      const businessName = document.getElementById('business_name').value;
      summaryHTML += `<p><strong>Razão Social:</strong> <span>${businessName}</span></p>`;
    }
    
    const zipCode = document.getElementById('zip_code').value;
    summaryHTML += `<p><strong>CEP:</strong> <span>${zipCode}</span></p>`;
    
    const address = document.getElementById('address').value;
    summaryHTML += `<p><strong>Rua:</strong> <span>${address}</span></p>`;
    
    const number = document.getElementById('number').value;
    summaryHTML += `<p><strong>Número:</strong> <span>${number}</span></p>`;
    
    const address1 = document.getElementById('address1').value;
    if (address1) {
      summaryHTML += `<p><strong>Complemento:</strong> <span>${address1}</span></p>`;
    }
    
    const neighborhood = document.getElementById('neighborhood').value;
    summaryHTML += `<p><strong>Bairro:</strong> <span>${neighborhood}</span></p>`;
    
    const city = document.getElementById('city').value;
    summaryHTML += `<p><strong>Cidade:</strong> <span>${city}</span></p>`;
    
    const state = document.getElementById('state').value;
    summaryHTML += `<p><strong>Estado:</strong> <span>${state}</span></p>`;
    summaryHTML += '</div>';
    
    // Payment Info Section
    summaryHTML += '<div class="summary-section">';
    summaryHTML += '<div class="summary-header">';
    summaryHTML += '<h3>Informações de Pagamento</h3>';
    summaryHTML += '<button class="summary-edit-btn" data-step="2" type="button">Editar</button>';
    summaryHTML += '</div>';
    
    const paymentDate = document.getElementById('payment_date').value;
    summaryHTML += `<p><strong>Data Vencimento Boleto:</strong> <span>${paymentDate}</span></p>`;
    
    const paymentType = document.getElementById('payment_type').value;
    const paymentTypeText = document.querySelector('select[name="payment_type"] option:checked').textContent;
    summaryHTML += `<p><strong>Tipo de Pagamento:</strong> <span>${paymentTypeText}</span></p>`;
    
    const billDate = document.getElementById('bill_date').value;
    const billDateText = document.querySelector('select[name="payment_type"]:nth-of-type(2) option:checked').textContent || document.querySelector('#bill_date option:checked').textContent;
    summaryHTML += `<p><strong>Vencimento do Boleto:</strong> <span>${billDateText}</span></p>`;
    
    const sentType = document.getElementById('sent_type').value;
    const sentTypeText = document.querySelector('select[name="sent_type"] option:checked').textContent;
    summaryHTML += `<p><strong>Forma de Envio:</strong> <span>${sentTypeText}</span></p>`;
    
    const financialEmail = document.getElementById('financial_email').value;
    summaryHTML += `<p><strong>E-mail NFs e Boletos:</strong> <span>${financialEmail}</span></p>`;
    summaryHTML += '</div>';
    
    summaryContent.innerHTML = summaryHTML;
    
    // Add event listeners to edit buttons
    const editButtons = summaryContent.querySelectorAll('.summary-edit-btn');
    editButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const stepIndex = parseInt(btn.dataset.step);
        this.goToStep(stepIndex);
      });
    });
  }

  goToStep(targetStep) {
    const currentElement = document.getElementById(this.steps[this.currentStep]);
    
    currentElement.classList.remove('active');
    currentElement.classList.add('exit');

    setTimeout(() => {
      currentElement.classList.remove('exit');
      currentElement.style.display = 'none';
      
      this.currentStep = targetStep;
      const targetElement = document.getElementById(this.steps[this.currentStep]);
      targetElement.style.display = 'flex';
      
      void targetElement.offsetWidth;
      targetElement.classList.add('active');
      
      this.updateProgress();
    }, 400);
  }

  submitForm(e) {
    e.preventDefault();
    
    // Send data to webhook
    if (typeof submitFormData === 'function') {
      submitFormData().then(success => {
        if (success) {
          alert('Formulário enviado com sucesso!');
          // Reset form if needed
          document.getElementById('closed_deal').reset();
        } else {
          alert('Aconteceu algum erro com a automação, favor verificar  com o responsável.');
        }
      }).catch(error => {
        console.error('Submission error:', error);
        alert('Aconteceu algum erro com a automação, favor verificar  com o responsável.');
      });
    }
  }

  resetForm() {
    const form = document.getElementById('closed_deal');
    if (form) form.reset();

    // Hide all steps and remove animation classes
    this.steps.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.style.display = 'none';
        el.classList.remove('active', 'exit');
      }
    });

    // Reset to first step
    this.currentStep = 0;
    const first = document.getElementById(this.steps[0]);
    if (first) {
      first.style.display = 'flex';
      void first.offsetWidth;
      first.classList.add('active');
    }

    this.updateProgress();
    this.updateFieldVisibility();

    // Clear summary content
    const summaryContent = document.getElementById('summary_content');
    if (summaryContent) summaryContent.innerHTML = '';
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new FormStepsManager();
});

// --- Input mask helpers (global functions) ---
function mascaraInteiro(field) {
  // allow empty or digits only
  return /^\d*$/.test(field.value.replace(/\D/g, ''));
}

function formataCampo(field, mask) {
  const onlyDigits = field.value.replace(/\D/g, '');
  let result = '';
  let di = 0;
  for (let i = 0; i < mask.length && di < onlyDigits.length; i++) {
    if (mask[i] === '0') {
      result += onlyDigits[di++];
    } else {
      result += mask[i];
    }
  }
  field.value = result;
  return true;
}

function MascaraCPF(cpfField) {
  if (!mascaraInteiro(cpfField)) return false;
  return formataCampo(cpfField, '000.000.000-00');
}

function MascaraCNPJ(cnpjField) {
  if (!mascaraInteiro(cnpjField)) return false;
  return formataCampo(cnpjField, '00.000.000/0000-00');
}

function MascaraCep(cepField) {
  if (!mascaraInteiro(cepField)) return false;
  return formataCampo(cepField, '00.000-000');
}

function isRomanNumeral(word) {
  // Matches valid Roman numerals (common strict pattern), case-insensitive
  // Examples: I, II, III, IV, V, VI, IX, X, XL, L, XC, C, CD, D, CM, M, etc.
  return /^[ivxlcdm]+$/i.test(word);
}

function capitalizeWords(field) {
  const words = field.value.split(' ');

  const capitalizedWords = words.map(word => {
    if (!word) return word;

    // Exception: keep Roman numerals uppercase (or "as-is" if you prefer)
    if (isRomanNumeral(word)) {
      return word.toUpperCase();
    }

    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });

  field.value = capitalizedWords.join(' ');
  return true;
}
