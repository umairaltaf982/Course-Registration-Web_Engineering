document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const form = document.querySelector('.edit-form');
    const alertCloseButtons = document.querySelectorAll('.close-alert');
    
    // Close alerts
    if (alertCloseButtons) {
        alertCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.alert').style.display = 'none';
            });
        });
    }
    
    // Form submission with method override
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
                    throw new Error('Failed to update student');
                }
                return response.json();
            })
            .then(data => {
                // Success notification
                showNotification('Student updated successfully', 'success');
                
                // Redirect after short delay
                setTimeout(() => {
                    window.location.href = '/admin/manage-students';
                }, 1500);
            })
            .catch(error => {
                console.error('Error updating student:', error);
                showNotification('Failed to update student', 'error');
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