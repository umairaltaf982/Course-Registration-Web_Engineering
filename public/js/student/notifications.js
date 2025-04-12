document.addEventListener('DOMContentLoaded', function() {
    // Get all subscribe buttons
    const subscribeButtons = document.querySelectorAll('.subscribe-btn');

    // Add click event listener to each subscribe button
    subscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const courseId = this.getAttribute('data-course-id');
            const button = this;

            // Change button text and style to indicate subscription in progress
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
            button.disabled = true;

            // Make AJAX call to subscribe to the course
            fetch('/student/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId: courseId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    button.innerHTML = '<i class="fas fa-check"></i> Subscribed';
                    button.style.backgroundColor = '#10b981'; // Change to green
                    showNotification('You will be notified when a seat becomes available', 'success');
                } else {
                    button.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
                    button.disabled = false;
                    showNotification(data.message || 'Failed to subscribe', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                button.innerHTML = '<i class="fas fa-bell"></i> Subscribe';
                button.disabled = false;
                showNotification('An error occurred. Please try again.', 'error');
            });
        });
    });

    // Get all unsubscribe buttons
    const unsubscribeButtons = document.querySelectorAll('.unsubscribe-btn');

    // Add click event listener to each unsubscribe button
    unsubscribeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const subscriptionId = this.getAttribute('data-subscription-id');
            const card = this.closest('.subscription-card');

            // Change button text and style to indicate unsubscription in progress
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Unsubscribing...';
            this.disabled = true;

            // Make AJAX call to unsubscribe from the course
            fetch('/student/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ subscriptionId: subscriptionId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the card with animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.remove();

                        // Check if there are no more subscriptions
                        const remainingCards = document.querySelectorAll('.subscription-card');
                        if (remainingCards.length === 0) {
                            // Show the no notifications message
                            const container = document.querySelector('.notifications-container');
                            container.innerHTML = `
                                <div class="no-notifications">
                                    <i class="fas fa-bell-slash"></i>
                                    <h3>No Notifications</h3>
                                    <p>You don't have any course subscriptions yet. Subscribe to courses to get notified when seats become available.</p>
                                    <a href="/student/courses" class="btn primary-btn">Browse Courses</a>
                                </div>
                            `;
                        }
                    }, 300);

                    showNotification('Successfully unsubscribed from course', 'success');
                } else {
                    this.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
                    this.disabled = false;
                    showNotification(data.message || 'Failed to unsubscribe', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.innerHTML = '<i class="fas fa-bell-slash"></i> Unsubscribe';
                this.disabled = false;
                showNotification('An error occurred. Please try again.', 'error');
            });
        });
    });

    // Function to show notification
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

        // Add to DOM
        document.body.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';

            // Remove from DOM after animation completes
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 4000);
    }
});
