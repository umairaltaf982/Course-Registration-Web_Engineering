document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.getElementById('edit-course-form');
    const prerequisitesField = document.getElementById('prerequisites');
    const availablePrerequisitesSelect = document.getElementById('availablePrerequisites');
    const addPrerequisiteBtn = document.getElementById('addPrerequisite');
    const selectedPrerequisitesList = document.getElementById('selectedPrerequisites');
    const alertCloseButtons = document.querySelectorAll('.close-alert');
    
    // Set up event listeners
    if (addPrerequisiteBtn && prerequisitesField && availablePrerequisitesSelect) {
        addPrerequisiteBtn.addEventListener('click', function() {
            const selectedOption = availablePrerequisitesSelect.options[availablePrerequisitesSelect.selectedIndex];
            if (selectedOption.value) {
                const currentPrereqs = prerequisitesField.value ? 
                    prerequisitesField.value.split(',') : [];
                
                // Check if already added
                if (!currentPrereqs.includes(selectedOption.value)) {
                    if (currentPrereqs.length > 0) {
                        prerequisitesField.value += `,${selectedOption.value}`;
                    } else {
                        prerequisitesField.value = selectedOption.value;
                    }
                    
                    updatePrerequisitesList();
                }
            }
        });
    }
    
    // Handle existing prerequisites remove buttons
    setupRemovePrerequisiteButtons();
    
    // Close alerts
    if (alertCloseButtons) {
        alertCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.alert').style.display = 'none';
            });
        });
    }
    
    // Handle form submission with method override
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            if (!validateForm()) {
                return;
            }
            
            // Create form data
            const formData = new FormData(form);
            
            // Convert form data to JSON
            const data = {};
            formData.forEach((value, key) => {
                // Skip the _method field for fetch
                if (key !== '_method') {
                    data[key] = value;
                }
            });
            
            // Make PUT request
            fetch(form.action, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update course');
                }
                return response.json();
            })
            .then(() => {
                // Success notification
                showNotification('Course updated successfully', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/admin/manage-courses';
                }, 1500);
            })
            .catch(error => {
                console.error('Error updating course:', error);
                showNotification('Failed to update course', 'error');
            });
        });
    }
    
    // Functions
    function validateForm() {
        const nameInput = document.getElementById('name');
        const codeInput = document.getElementById('code');
        
        if (!nameInput.value.trim()) {
            showInputError(nameInput, 'Course name is required');
            return false;
        }
        
        if (!codeInput.value.trim()) {
            showInputError(codeInput, 'Course code is required');
            return false;
        }
        
        return true;
    }
    
    function showInputError(inputElement, message) {
        // Add error styling
        inputElement.style.borderColor = '#ef4444';
        
        // Create error message if it doesn't exist
        const errorId = `${inputElement.id}-error`;
        let errorElement = document.getElementById(errorId);
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.id = errorId;
            errorElement.className = 'input-error';
            errorElement.style.color = '#ef4444';
            errorElement.style.fontSize = '12px';
            errorElement.style.marginTop = '4px';
            
            inputElement.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        
        // Remove error on input
        inputElement.addEventListener('input', function onInput() {
            inputElement.style.borderColor = '';
            if (errorElement) {
                errorElement.textContent = '';
            }
            inputElement.removeEventListener('input', onInput);
        });
        
        // Scroll to the error
        inputElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
    
    function updatePrerequisitesList() {
        if (!selectedPrerequisitesList || !prerequisitesField || !availablePrerequisitesSelect) return;
        
        const prerequisites = prerequisitesField.value ? prerequisitesField.value.split(',') : [];
        
        selectedPrerequisitesList.innerHTML = '';
        
        if (prerequisites.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'No prerequisites selected';
            emptyItem.className = 'empty-prereqs';
            selectedPrerequisitesList.appendChild(emptyItem);
            return;
        }
        
        prerequisites.forEach(prereqId => {
            const option = Array.from(availablePrerequisitesSelect.options)
                .find(opt => opt.value === prereqId);
            
            if (option) {
                const li = document.createElement('li');
                li.textContent = option.textContent;
                
                const removeButton = document.createElement('button');
                removeButton.innerHTML = '<i class="fas fa-times"></i> Remove';
                removeButton.type = 'button';
                removeButton.className = 'remove-prereq';
                removeButton.dataset.id = prereqId;
                
                removeButton.addEventListener('click', function() {
                    const updatedPrereqs = prerequisites.filter(id => id !== this.dataset.id);
                    prerequisitesField.value = updatedPrereqs.join(',');
                    updatePrerequisitesList();
                });
                
                li.appendChild(removeButton);
                selectedPrerequisitesList.appendChild(li);
            }
        });
    }
    
    function setupRemovePrerequisiteButtons() {
        const removeButtons = document.querySelectorAll('.remove-prereq');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const prereqId = this.dataset.id;
                const currentPrereqs = prerequisitesField.value ? 
                    prerequisitesField.value.split(',') : [];
                
                const updatedPrereqs = currentPrereqs.filter(id => id !== prereqId);
                prerequisitesField.value = updatedPrereqs.join(',');
                
                updatePrerequisitesList();
            });
        });
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: type === 'success' ? '#10b981' : '#ef4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: '1000',
            opacity: '0',
            transform: 'translateY(20px)',
            transition: 'all 0.3s ease-out'
        });
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});