document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const courseSearchInput = document.getElementById('courseSearch');
    const courseList = document.getElementById('course-list');
    const addCourseForm = document.getElementById('add-course-form');
    const deleteButtons = document.querySelectorAll('.delete-btn');
    const alertCloseButtons = document.querySelectorAll('.close-alert');
    
    // Modal elements
    const deleteModal = document.getElementById('deleteModal');
    const closeModalButton = document.querySelector('.close-modal');
    const cancelDeleteButton = document.getElementById('cancelDelete');
    const confirmDeleteButton = document.getElementById('confirmDelete');
    const courseToDeleteDisplay = document.getElementById('courseToDelete');
    
    // Current course to delete
    let currentCourseId = null;
    let currentCourseName = null;
    
    // Handle prerequisites
    setupPrerequisites();
    
    // Course search functionality
    if (courseSearchInput && courseList) {
        courseSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim().toLowerCase();
            const courseCards = courseList.querySelectorAll('.course-card');
            
            courseCards.forEach(card => {
                const courseName = card.querySelector('h3').textContent.toLowerCase();
                const courseCode = card.querySelector('.course-code').textContent.toLowerCase();
                
                if (courseName.includes(searchTerm) || courseCode.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
    
    // Form validation
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', function(e) {
            const nameInput = document.getElementById('name');
            const codeInput = document.getElementById('code');
            
            if (nameInput.value.trim() === '') {
                e.preventDefault();
                showInputError(nameInput, 'Course name is required');
                return;
            }
            
            if (codeInput.value.trim() === '') {
                e.preventDefault();
                showInputError(codeInput, 'Course code is required');
                return;
            }
        });
    }
    
    // Close alerts
    if (alertCloseButtons) {
        alertCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.alert').style.display = 'none';
            });
        });
    }
    
    // Delete course buttons
    if (deleteButtons) {
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const courseId = this.getAttribute('data-course-id');
                const courseCard = this.closest('.course-card');
                const courseName = courseCard.querySelector('h3').textContent;
                
                currentCourseId = courseId;
                currentCourseName = courseName;
                
                // Update modal and show it
                courseToDeleteDisplay.textContent = courseName;
                deleteModal.style.display = 'block';
            });
        });
    }
    
    // Close modal
    if (closeModalButton) {
        closeModalButton.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }
    
    // Cancel delete
    if (cancelDeleteButton) {
        cancelDeleteButton.addEventListener('click', function() {
            deleteModal.style.display = 'none';
        });
    }
    
    // Confirm delete
    if (confirmDeleteButton) {
        confirmDeleteButton.addEventListener('click', function() {
            if (currentCourseId) {
                deleteCourse(currentCourseId);
            }
        });
    }
    
    // Click outside modal to close
    window.addEventListener('click', function(e) {
        if (e.target === deleteModal) {
            deleteModal.style.display = 'none';
        }
    });
    
    // Functions
    function setupPrerequisites() {
        const prerequisitesField = document.getElementById('prerequisites');
        const allCoursesSelect = document.getElementById('availablePrerequisites');
        const addPrereqButton = document.getElementById('addPrerequisite');
        const prerequisitesList = document.getElementById('selectedPrerequisites');
        
        if (prerequisitesField && allCoursesSelect && addPrereqButton && prerequisitesList) {
            // Initialize from existing prerequisites if editing
            updatePrerequisitesList();
            
            addPrereqButton.addEventListener('click', function() {
                const selectedOption = allCoursesSelect.options[allCoursesSelect.selectedIndex];
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
    }
    
    function updatePrerequisitesList() {
        const prerequisitesField = document.getElementById('prerequisites');
        const allCoursesSelect = document.getElementById('availablePrerequisites');
        const prerequisitesList = document.getElementById('selectedPrerequisites');
        
        if (!prerequisitesField || !prerequisitesList || !allCoursesSelect) return;
        
        const prerequisites = prerequisitesField.value ? 
            prerequisitesField.value.split(',') : [];
        
        prerequisitesList.innerHTML = '';
        
        if (prerequisites.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = 'No prerequisites selected';
            emptyItem.className = 'empty-prereqs';
            prerequisitesList.appendChild(emptyItem);
            return;
        }
        
        prerequisites.forEach(prereqId => {
            const option = Array.from(allCoursesSelect.options)
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
                prerequisitesList.appendChild(li);
            }
        });
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
    }
    
    function deleteCourse(courseId) {
        // Show loading state in modal
        confirmDeleteButton.disabled = true;
        confirmDeleteButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
        
        fetch(`/api/courses/${courseId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete course');
                }
                return response.json();
            })
            .then(() => {
                // Success - remove the card and close modal
                const courseCard = document.querySelector(`.course-card[data-course-id="${courseId}"]`);
                if (courseCard) {
                    courseCard.style.opacity = '0';
                    courseCard.style.transform = 'scale(0.9)';
                    
                    setTimeout(() => {
                        courseCard.remove();
                        
                        // Show empty state if no courses left
                        if (courseList && courseList.children.length === 0) {
                            const emptyState = document.createElement('div');
                            emptyState.className = 'empty-state';
                            emptyState.innerHTML = `
                                <i class="fas fa-info-circle"></i>
                                <p>No courses available</p>
                            `;
                            courseList.appendChild(emptyState);
                        }
                    }, 300);
                }
                
                deleteModal.style.display = 'none';
                
                // Show success message
                showNotification('Course deleted successfully', 'success');
            })
            .catch(error => {
                console.error('Error deleting course:', error);
                
                // Show error in modal
                confirmDeleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Delete Course';
                confirmDeleteButton.disabled = false;
                
                // Show error notification
                showNotification('Failed to delete course', 'error');
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