document.addEventListener('DOMContentLoaded', () => {
    if (window.AOS) {
        AOS.init({
            duration: 800,
            once: true,
            offset: 50,
        });
    }

    const body = document.body;

    const setModalState = (modal, isOpen) => {
        if (!modal) {
            return;
        }

        modal.classList.toggle('open', isOpen);
        if (isOpen) {
            body.classList.add('modal-open');
        } else if (!document.querySelector('#modal-container.open, #form-modal-container.open')) {
            body.classList.remove('modal-open');
        }
    };

    const teamModal = document.getElementById('modal-container');
    const teamMembers = document.querySelectorAll('.team-member');

    if (teamModal && teamMembers.length) {
        const closeButton = teamModal.querySelector('.close-button');
        const modalName = document.getElementById('modal-name');
        const modalBio = document.getElementById('modal-bio');
        const modalImg = document.getElementById('modal-img');

        const openTeamModal = (name, bio, imgSrc) => {
            modalName.textContent = name;
            modalBio.textContent = bio;
            modalImg.src = imgSrc;
            modalImg.alt = `${name} photo`;
            setModalState(teamModal, true);
        };

        teamMembers.forEach((member) => {
            member.addEventListener('click', (event) => {
                if (event.target.closest('.linkedin-link')) {
                    return;
                }

                openTeamModal(
                    member.dataset.name || '',
                    member.dataset.bio || '',
                    member.dataset.img || ''
                );
            });
        });

        closeButton?.addEventListener('click', () => setModalState(teamModal, false));
        teamModal.addEventListener('click', (event) => {
            if (event.target === teamModal) {
                setModalState(teamModal, false);
            }
        });
    }

    const formModal = document.getElementById('form-modal-container');
    const contactForm = document.getElementById('datasheet-contact-form');

    if (formModal && contactForm) {
        const modalTitle = document.getElementById('form-modal-title');
        const modalIntro = document.getElementById('form-modal-intro');
        const subjectInput = document.getElementById('contact-subject');
        const contextInput = document.getElementById('contact-context');
        const messageInput = document.getElementById('contact-message');
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const formStatus = document.getElementById('contact-form-status');
        const closeFormButtons = formModal.querySelectorAll('[data-close-form]');
        const openFormButtons = document.querySelectorAll('[data-modal-trigger]');

        const defaults = {
            title: 'Request information',
            intro: 'Share your details and RX Watt will receive the request directly through the site.',
            subject: 'RX Watt enquiry',
            message: 'I would like to learn more about RX Watt.',
            context: 'General enquiry',
        };

        const openFormModal = (button) => {
            const title = button.dataset.modalTitle || defaults.title;
            const intro = button.dataset.modalIntro || defaults.intro;
            const subject = button.dataset.subject || defaults.subject;
            const message = button.dataset.message || defaults.message;
            const context = button.dataset.context || defaults.context;

            contactForm.reset();
            modalTitle.textContent = title;
            modalIntro.textContent = intro;
            subjectInput.value = subject;
            contextInput.value = context;
            messageInput.value = message;
            if (formStatus) {
                formStatus.textContent = '';
                formStatus.dataset.state = '';
            }
            setModalState(formModal, true);
        };

        openFormButtons.forEach((button) => {
            button.addEventListener('click', () => openFormModal(button));
        });

        closeFormButtons.forEach((button) => {
            button.addEventListener('click', () => setModalState(formModal, false));
        });

        formModal.addEventListener('click', (event) => {
            if (event.target === formModal) {
                setModalState(formModal, false);
            }
        });

        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const data = new FormData(contactForm);
            const name = (data.get('name') || '').toString().trim();
            const email = (data.get('email') || '').toString().trim();
            const context = (data.get('context') || '').toString().trim();
            const query = (data.get('query') || '').toString().trim();
            const subject = (data.get('subject') || defaults.subject).toString().trim();

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Sending...';
            }

            if (formStatus) {
                formStatus.textContent = '';
                formStatus.dataset.state = '';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        context,
                        query,
                        subject,
                    }),
                });

                const payload = await response.json();

                if (!response.ok || !payload.ok) {
                    throw new Error(payload.message || 'We could not send your request right now.');
                }

                if (formStatus) {
                    formStatus.textContent = payload.message || 'Your request has been sent.';
                    formStatus.dataset.state = 'success';
                }

                contactForm.reset();
                subjectInput.value = subject;
                contextInput.value = context;
                messageInput.value = defaults.message;

                window.setTimeout(() => {
                    setModalState(formModal, false);
                }, 1200);
            } catch (error) {
                if (formStatus) {
                    formStatus.textContent = error.message || 'We could not send your request right now.';
                    formStatus.dataset.state = 'error';
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Send Request';
                }
            }
        });
    }

    window.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        document.querySelectorAll('#modal-container.open, #form-modal-container.open').forEach((modal) => {
            setModalState(modal, false);
        });
    });
});
