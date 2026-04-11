// ============================================
// Offerte Wizard — Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('offerteForm');
  const steps = document.querySelectorAll('.wizard-step');
  const progressSteps = document.querySelectorAll('.progress-step');
  const progressFill = document.getElementById('progressFill');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnSubmit = document.getElementById('btnSubmit');
  const wizardNav = document.getElementById('wizardNav');
  const wizardSuccess = document.getElementById('wizardSuccess');

  let currentStep = 1;
  const totalSteps = 4;

  // --- Mobile nav toggle ---
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Update UI ---
  function updateWizard() {
    // Show active step
    steps.forEach(s => {
      s.classList.remove('active');
      if (parseInt(s.dataset.step) === currentStep) s.classList.add('active');
    });

    // Update progress dots
    progressSteps.forEach(ps => {
      const step = parseInt(ps.dataset.step);
      ps.classList.remove('active', 'completed');
      if (step === currentStep) ps.classList.add('active');
      if (step < currentStep) ps.classList.add('completed');
    });

    // Update progress bar
    progressFill.style.width = ((currentStep) / totalSteps * 100) + '%';

    // Button visibility
    btnPrev.style.visibility = currentStep === 1 ? 'hidden' : 'visible';

    if (currentStep === totalSteps) {
      btnNext.style.display = 'none';
      btnSubmit.style.display = 'inline-flex';
      populateReview();
    } else {
      btnNext.style.display = 'inline-flex';
      btnSubmit.style.display = 'none';
    }

    // Scroll to top of wizard
    document.querySelector('.wizard-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // --- Validation ---
  function validateStep(step) {
    const currentStepEl = document.querySelector(`.wizard-step[data-step="${step}"]`);
    const requiredFields = currentStepEl.querySelectorAll('[required]');
    let valid = true;

    requiredFields.forEach(field => {
      field.classList.remove('error');

      if (field.type === 'radio') {
        const name = field.name;
        const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
        if (!checked) {
          valid = false;
          // Shake the grid
          const grid = currentStepEl.querySelector('.service-select-grid');
          if (grid) {
            grid.classList.add('shake');
            setTimeout(() => grid.classList.remove('shake'), 400);
          }
        }
      } else if (field.type === 'checkbox') {
        if (!field.checked) {
          valid = false;
          field.closest('.consent-check').classList.add('shake');
          setTimeout(() => field.closest('.consent-check').classList.remove('shake'), 400);
        }
      } else if (!field.value.trim()) {
        valid = false;
        field.classList.add('error');
        field.classList.add('shake');
        setTimeout(() => field.classList.remove('shake'), 400);
      }
    });

    return valid;
  }

  // --- Populate review ---
  function populateReview() {
    const val = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      if (!el) return '-';
      if (el.type === 'radio') {
        const checked = form.querySelector(`[name="${name}"]:checked`);
        return checked ? checked.value : '-';
      }
      return el.value || '-';
    };

    document.getElementById('reviewService').textContent = val('dienst');
    document.getElementById('reviewProperty').textContent = val('type_pand');
    document.getElementById('reviewRooms').textContent = val('aantal_ruimtes');
    document.getElementById('reviewTiming').textContent = val('planning');

    const desc = val('omschrijving');
    const descWrap = document.getElementById('reviewDescWrap');
    if (desc && desc !== '-') {
      descWrap.style.display = 'block';
      document.getElementById('reviewDesc').textContent = desc;
    } else {
      descWrap.style.display = 'none';
    }

    const firstName = val('voornaam');
    const lastName = val('achternaam');
    document.getElementById('reviewName').textContent =
      (firstName !== '-' || lastName !== '-') ? `${firstName} ${lastName}` : '-';
    document.getElementById('reviewEmail').textContent = val('email');
    document.getElementById('reviewPhone').textContent = val('telefoon');

    const street = val('adres');
    const city = val('gemeente');
    const addressParts = [street, city].filter(v => v && v !== '-');
    document.getElementById('reviewAddress').textContent = addressParts.length ? addressParts.join(', ') : '-';
  }

  // --- Navigation ---
  btnNext.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) {
      currentStep++;
      updateWizard();
    }
  });

  btnPrev.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateWizard();
    }
  });

  // --- Form Submit ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    // Honeypot check (spam bots fill hidden fields)
    const honey = form.querySelector('[name="_honey"]');
    if (honey && honey.value) return;

    const submitBtn = btnSubmit;
    const originalHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="btn-loading"></span> Versturen...';
    submitBtn.disabled = true;

    // Collect form data as JSON
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (!key.startsWith('_')) data[key] = value;
    });

    fetch(form.action, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(result => {
      if (result.success) {
        showSuccess();
      } else {
        showError(result.message || 'Er is iets misgegaan. Probeer het opnieuw.');
      }
    })
    .catch(() => {
      showError('Verbindingsfout. Controleer uw internetverbinding en probeer het opnieuw.');
    });

    function showSuccess() {
      steps.forEach(s => s.classList.remove('active'));
      wizardNav.style.display = 'none';
      wizardSuccess.classList.add('active');
      document.querySelector('.wizard-progress').style.display = 'none';
      document.querySelector('.wizard-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function showError(message) {
      submitBtn.innerHTML = originalHTML;
      submitBtn.disabled = false;
      // Show error message below submit button
      let errorEl = document.getElementById('submitError');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'submitError';
        errorEl.style.cssText = 'color:#e74c3c;text-align:center;margin-top:16px;font-size:14px;';
        wizardNav.parentNode.insertBefore(errorEl, wizardNav.nextSibling);
      }
      errorEl.textContent = message;
      setTimeout(() => { if (errorEl) errorEl.remove(); }, 8000);
    }
  });

  // --- Keyboard: Enter to next ---
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        btnNext.click();
      }
    }
  });

  // --- Init ---
  updateWizard();
});
