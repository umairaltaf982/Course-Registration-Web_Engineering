document.addEventListener('DOMContentLoaded', function() {
      
    const form = document.getElementById('add-student-form');
    const alertCloseButtons = document.querySelectorAll('.close-alert');
    
      
    if (alertCloseButtons) {
        alertCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.alert').style.display = 'none';
            });
        });
    }
    
      
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
              
            const formData = new FormData(form);
            
              
            const data = {};
            formData.forEach((value, key) => {
                data[key] = value;
            });
            
              
            fetch(form.action, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.message || 'Failed to add student');
                    });
                }
                return response.json();
            })
            .then(() => {
                  
                showNotification('Student added successfully', 'success');
                
                  
                form.reset();
                
                  
                setTimeout(() => {
                    window.location.href = '/admin/manage-students?success=Student added successfully';
                }, 1500);
            })
            .catch(error => {
                console.error('Error adding student:', error);
                showNotification(error.message || 'Failed to add student', 'error');
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
        
          
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
          
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});