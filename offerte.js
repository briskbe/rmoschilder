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
  const wizardError = document.getElementById('wizardError');
  const btnRetry = document.getElementById('btnRetry');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    // Honeypot check
    if (form.querySelector('[name="_honey"]').value) return;

    const originalHTML = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<span class="btn-loading"></span> Versturen...';
    btnSubmit.disabled = true;

    const payload = {
      dienst: (form.querySelector('[name="dienst"]:checked') || {}).value || '',
      type_pand: form.querySelector('[name="type_pand"]').value,
      aantal_ruimtes: form.querySelector('[name="aantal_ruimtes"]').value,
      planning: form.querySelector('[name="planning"]').value,
      omschrijving: form.querySelector('[name="omschrijving"]').value,
      voornaam: form.querySelector('[name="voornaam"]').value,
      achternaam: form.querySelector('[name="achternaam"]').value,
      email: form.querySelector('[name="email"]').value,
      telefoon: form.querySelector('[name="telefoon"]').value,
      adres: form.querySelector('[name="adres"]').value,
      gemeente: form.querySelector('[name="gemeente"]').value,
    };

    fetch('/api/send-offerte', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    .then(res => {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    })
    .then(() => showSuccess())
    .catch(() => showError())
    .finally(() => {
      btnSubmit.innerHTML = originalHTML;
      btnSubmit.disabled = false;
    });
  });

  function showSuccess() {
    steps.forEach(s => s.classList.remove('active'));
    wizardNav.style.display = 'none';
    wizardError.style.display = 'none';
    wizardSuccess.classList.add('active');
    document.querySelector('.wizard-progress').style.display = 'none';
    document.querySelector('.wizard-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showError() {
    steps.forEach(s => s.classList.remove('active'));
    wizardNav.style.display = 'none';
    wizardSuccess.classList.remove('active');
    wizardError.style.display = '';
    wizardError.classList.add('active');
    document.querySelector('.wizard-progress').style.display = 'none';
    document.querySelector('.wizard-header').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Retry button — reset wizard to step 4 so user can resubmit
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      wizardError.style.display = 'none';
      wizardError.classList.remove('active');
      wizardNav.style.display = '';
      document.querySelector('.wizard-progress').style.display = '';
      currentStep = totalSteps;
      updateWizard();
    });
  }

  // --- Keyboard: Enter to next ---
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        btnNext.click();
      }
    }
  });
});
