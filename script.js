document.addEventListener('DOMContentLoaded', () => {

    // Initialize Animate On Scroll Library
    AOS.init({
        duration: 800,   // Animation duration
        once: true,      // Animate elements only once
        offset: 50,      // Offset (in px) from the original trigger point
    });

    // --- Team Member Modal Logic ---
    const modalContainer = document.getElementById('modal-container');
    const closeButton = document.querySelector('.close-button');
    const teamMembers = document.querySelectorAll('.team-member');

    // Function to open the modal
    const openModal = (name, bio, imgSrc) => {
        document.getElementById('modal-name').textContent = name;
        document.getElementById('modal-bio').textContent = bio;
        document.getElementById('modal-img').src = imgSrc;
        modalContainer.style.display = 'flex';
    };

    // Function to close the modal
    const closeModal = () => {
        modalContainer.style.display = 'none';
    };

    // Add click event to each team member
    teamMembers.forEach(member => {
        member.addEventListener('click', (e) => {
            // Don't open modal if the LinkedIn link was clicked
            if (e.target.classList.contains('linkedin-link')) {
                return;
            }
            
            const name = member.dataset.name;
            const bio = member.dataset.bio;
            const imgSrc = member.dataset.img;
            openModal(name, bio, imgSrc);
        });
    });

    // Add click event to the close button
    closeButton.addEventListener('click', closeModal);

    // Add click event to the modal container (to close by clicking outside the content)
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
            closeModal();
        }
    });

    // Close modal with the 'Escape' key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalContainer.style.display === 'flex') {
            closeModal();
        }
    });
});
