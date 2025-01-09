document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section'); 
    const navLinks = document.querySelectorAll('.sidebar-links a');

    window.addEventListener('scroll', () => {
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop - 60) { 
            currentSection = section.getAttribute('id');
            }
        });
  
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
        if (nearBottom) {
            const lastSection = sections[sections.length - 1];
            currentSection = lastSection.getAttribute('id');
        }
  
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                console.log('Adding active class to:', link);
                link.classList.add('active');
            }
        });
    });
});


document.querySelectorAll('.user-information-field').forEach(field => {
    const inputField = field.querySelector('.editable');
    const editIcon = field.querySelector('.edit-icon');

    if (inputField && editIcon) {
        editIcon.addEventListener('click', function() {
            inputField.removeAttribute('readonly'); 
            inputField.focus(); 

            const end = inputField.value.length;
            inputField.setSelectionRange(end, end);
        });

        inputField.addEventListener('focus', function() {
            editIcon.style.visibility = 'hidden'; 
        });

        inputField.addEventListener('blur', function() {
            editIcon.style.visibility = 'visible'; 
        });
    }
});


function toggleDropdown(event) {
    const dropdown = event.target.nextElementSibling; 
    const isVisible = dropdown.style.display === "block"; 
    dropdown.style.display = isVisible ? "none" : "block"; 
  
    const allDropdowns = document.querySelectorAll('.options-dropdown');
    allDropdowns.forEach((otherDropdown) => {
        if (otherDropdown !== dropdown) {
            otherDropdown.style.display = "none";
        }
    });
  
    event.stopPropagation(); 
}
  
  
document.addEventListener('click', function(event) {
    const allDropdowns = document.querySelectorAll('.options-dropdown');
    allDropdowns.forEach((dropdown) => {
        dropdown.style.display = "none";
    });
});

function handleClick(event) {
    event.stopPropagation(); 
    event.preventDefault(); 

    const trigger = event.target.closest('[data-open-modal]');
    const modalId = trigger.getAttribute('data-open-modal');
    const modal = document.querySelector(`#${modalId}`);
    if (modal) {
        modal.showModal();
        modal.dataset.source = 'link';
        modal.dataset.href = trigger.getAttribute('href');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-open-modal]');
        console.log(trigger)
        if (trigger) {
            event.preventDefault();
            const modalId = trigger.getAttribute('data-open-modal');
            const modal = document.querySelector(`#${modalId}`);
            if (modal) {
                modal.showModal();
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        if (event.target.matches('[data-close-modal]')) {
            const modal = event.target.closest('dialog');
            if (modal) modal.close();
        }
    });

    document.body.addEventListener('click', (event) => {
        if (event.target.matches('[data-confirm-modal]')) {
            event.preventDefault(); 
            const modal = event.target.closest('dialog');
            if (modal) {
                modal.close();
                const source = modal.dataset.source;

                if (source === 'form') {
                    const formId = modal.dataset.formId;
                    const form = document.querySelector(`#${formId}`);
                    if (form){
                        form.submit(); 
                    } 
                } else if (source === 'link') {
                    const href = modal.dataset.href;
                    if (href) {
                        window.location.href = href;
                    }
                    
                }
            }
        }
    });

    document.body.addEventListener('click', (event) => {
        const modal = document.querySelector('dialog[open]');
        if (modal && event.target === modal) {
            modal.close();
        }
    });
});
