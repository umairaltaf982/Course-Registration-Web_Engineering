document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const scheduleTable = document.getElementById('schedule-table');
    const conflictWarning = document.getElementById('conflict-warning');
    const printButton = document.getElementById('print-schedule');
    const saveButton = document.getElementById('save-schedule');
    
    // DOM elements for course info
    const courseDetailPanel = document.getElementById('course-details-panel');
    const selectedCourseDetails = document.getElementById('selected-course-details');
    const closeDetailsBtn = document.getElementById('close-details');
    
    // Check for conflicts on page load and set up event listeners
    initializeSchedule();
    
    function initializeSchedule() {
        // Check for conflicts
        checkForConflicts();
        
        // Add event listeners
        setupRemoveButtons();
        setupCourseDetailView();
        
        // Schedule actions
        if (printButton) {
            printButton.addEventListener('click', function() {
                window.print();
            });
        }
        
        if (saveButton) {
            saveButton.addEventListener('click', function() {
                savePermanentSchedule();
            });
        }
        
        if (closeDetailsBtn) {
            closeDetailsBtn.addEventListener('click', function() {
                courseDetailPanel.style.display = 'none';
            });
        }
    }
    
    // Helper functions
    function checkForConflicts() {
        const slots = {};
        let hasConflicts = false;
        
        // Get all course elements in the schedule
        const courseElements = document.querySelectorAll('.course-card');
        
        courseElements.forEach(course => {
            const cell = course.closest('.schedule-cell');
            if (!cell) return;
            
            const day = cell.dataset.day;
            const hour = cell.dataset.hour;
            const key = `${day}-${hour}`;
            
            if (slots[key]) {
                // We have a conflict
                hasConflicts = true;
            } else {
                slots[key] = course;
            }
        });
        
        // Show warning if conflicts exist
        if (conflictWarning) {
            conflictWarning.style.display = hasConflicts ? 'flex' : 'none';
        }
        
        return hasConflicts;
    }
    
    function setupRemoveButtons() {
        const removeButtons = document.querySelectorAll('.remove-course');
        
        removeButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Don't trigger the course click event
                
                const courseId = this.dataset.courseId;
                showConfirmRemoveDialog(courseId);
            });
        });
    }
    
    function showConfirmRemoveDialog(courseId) {
        if (confirm('Are you sure you want to remove this course from your schedule?')) {
            removeCourse(courseId);
        }
    }
    
    function setupCourseDetailView() {
        const courseElements = document.querySelectorAll('.course-card');
        
        courseElements.forEach(course => {
            course.addEventListener('click', function(e) {
                // Don't trigger if the remove button was clicked
                if (e.target.classList.contains('remove-course')) return;
                
                const courseId = this.dataset.courseId;
                showCourseDetails(courseId);
            });
        });
    }
    
    function showCourseDetails(courseId) {
        // Show the panel (with loading state)
        courseDetailPanel.style.display = 'block';
        selectedCourseDetails.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>Loading course details...</p>
            </div>
        `;
        
        fetch(`/api/courses/${courseId}`)
            .then(response => response.json())
            .then(course => {
                if (selectedCourseDetails) {
                    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                    
                    // Create detailed view
                    let detailsHTML = `
                        <h4>${course.name} (${course.code})</h4>
                        
                        <div class="course-detail-grid">
                            <div class="detail-column">
                                <p><strong>Department:</strong> ${course.department}</p>
                                <p><strong>Credit Hours:</strong> ${course.creditHours}</p>
                                <p><strong>Schedule:</strong> ${dayNames[course.schedule.day]}, 
                                   ${course.schedule.startTime}:00 - ${course.schedule.startTime + 1}:00</p>
                            </div>
                            <div class="detail-column">
                                <p><strong>Available Seats:</strong> <span class="availability ${course.seatsAvailable > 5 ? 'good' : course.seatsAvailable > 0 ? 'warning' : 'bad'}">${course.seatsAvailable}</span> / ${course.totalSeats}</p>
                                <p><strong>Course Level:</strong> ${Math.floor(parseInt(course.code.match(/\d+/)[0])/100)*100}-level</p>
                            </div>
                        </div>
                        
                        <div class="course-description">
                            <h5>Description:</h5>
                            <p>${course.description || 'No description available for this course.'}</p>
                        </div>
                    `;
                    
                    // Add prerequisites if any
                    if (course.prerequisites && course.prerequisites.length > 0) {
                        detailsHTML += '<div class="prerequisites-section"><h5>Prerequisites:</h5><ul class="prereq-list">';
                        course.prerequisites.forEach(prereq => {
                            detailsHTML += `<li>${prereq.name} (${prereq.code})</li>`;
                        });
                        detailsHTML += '</ul></div>';
                    } else {
                        detailsHTML += '<div class="prerequisites-section"><h5>Prerequisites:</h5><p>No prerequisites required</p></div>';
                    }
                    
                    selectedCourseDetails.innerHTML = detailsHTML;
                    
                    // Add styles for the details
                    const style = document.createElement('style');
                    style.textContent = `
                        .course-detail-grid {
                            display: grid;
                            grid-template-columns: 1fr 1fr;
                            gap: 15px;
                            margin-bottom: 20px;
                        }
                        .course-description {
                            background: #f8fafc;
                            padding: 15px;
                            border-radius: 6px;
                            margin-bottom: 20px;
                        }
                        .course-description h5 {
                            margin: 0 0 8px 0;
                            color: #2e4057;
                        }
                        .course-description p {
                            margin: 0;
                            line-height: 1.5;
                        }
                        .prerequisites-section h5 {
                            margin: 0 0 8px 0;
                            color: #2e4057;
                        }
                        .prereq-list {
                            margin: 0;
                            padding-left: 20px;
                        }
                        .prereq-list li {
                            margin-bottom: 5px;
                        }
                        .availability {
                            font-weight: bold;
                        }
                        .availability.good { color: #059669; }
                        .availability.warning { color: #d97706; }
                        .availability.bad { color: #dc2626; }
                        .loading-spinner {
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            padding: 30px;
                        }
                        .spinner {
                            width: 40px;
                            height: 40px;
                            border: 4px solid #f3f3f3;
                            border-top: 4px solid #3498db;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin-bottom: 15px;
                        }
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                        @media (max-width: 500px) {
                            .course-detail-grid {
                                grid-template-columns: 1fr;
                            }
                        }
                    `;
                    selectedCourseDetails.appendChild(style);
                }
            })
            .catch(error => {
                console.error('Error fetching course details:', error);
                if (selectedCourseDetails) {
                    selectedCourseDetails.innerHTML = `
                        <div class="error-state">
                            <div class="error-icon">❌</div>
                            <h4>Error Loading Details</h4>
                            <p>Sorry, we couldn't load the course details. Please try again later.</p>
                        </div>
                    `;
                }
            });
    }
    
    function removeCourse(courseId) {
        if (!courseId) return;
        
        // Show removing state
        const courseElement = document.querySelector(`.course-card[data-course-id="${courseId}"]`);
        if (courseElement) {
            courseElement.classList.add('removing');
            courseElement.innerHTML = '<div class="removing-indicator">Removing...</div>';
        }
        
        fetch('/api/students/remove-course', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the course element with animation
                    if (courseElement) {
                        courseElement.style.height = '0';
                        courseElement.style.opacity = '0';
                        courseElement.style.padding = '0';
                        courseElement.style.margin = '0';
                        
                        // Then reload the page after animation
                        setTimeout(() => {
                            window.location.reload();
                        }, 500);
                    } else {
                        window.location.reload();
                    }
                } else {
                    alert('Failed to remove course: ' + data.message);
                    // Restore the element if there was an error
                    if (courseElement) {
                        courseElement.classList.remove('removing');
                        // We'll reload to restore the proper state
                        window.location.reload();
                    }
                }
            })
            .catch(error => {
                console.error('Error removing course:', error);
                alert('An error occurred while removing the course. Please try again.');
                if (courseElement) {
                    window.location.reload();
                }
            });
    }
    
    function savePermanentSchedule() {
        // Show saving indicator
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<div class="spinner-small"></div> Saving...';
        saveButton.disabled = true;
        
        fetch('/student/save-schedule', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        })
            .then(response => response.json())
            .then(data => {
                // Restore button
                setTimeout(() => {
                    saveButton.innerHTML = originalText;
                    saveButton.disabled = false;
                    
                    if (data.success) {
                        // Show success message
                        const successMessage = document.createElement('div');
                        successMessage.className = 'success-toast';
                        successMessage.innerHTML = '<div class="success-icon">✓</div><div>Schedule saved successfully!</div>';
                        document.body.appendChild(successMessage);
                        
                        // Auto-remove the success message
                        setTimeout(() => {
                            successMessage.style.opacity = '0';
                            setTimeout(() => {
                                document.body.removeChild(successMessage);
                            }, 300);
                        }, 3000);
                    } else {
                        alert('Failed to save schedule: ' + data.message);
                    }
                }, 800); // Ensure the saving indicator shows for at least 800ms
            })
            .catch(error => {
                console.error('Error saving schedule:', error);
                saveButton.innerHTML = originalText;
                saveButton.disabled = false;
                alert('An error occurred while saving the schedule. Please try again.');
            });
            
        // Add styles for the spinner and toast
        const style = document.createElement('style');
        style.textContent = `
            .spinner-small {
                width: 18px;
                height: 18px;
                border: 2px solid rgba(255, 255, 255, 0.3);
                border-top: 2px solid white;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                display: inline-block;
                vertical-align: middle;
                margin-right: 6px;
            }
            .success-toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #10b981;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 1000;
                animation: slideIn 0.3s ease-out forwards;
                transition: opacity 0.3s;
            }
            .success-icon {
                background: rgba(255, 255, 255, 0.2);
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            }
            .removing-indicator {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100%;
                color: #6b7280;
                font-style: italic;
                font-size: 12px;
            }
            .course-card.removing {
                background: #f3f4f6;
                border: 1px dashed #d1d5db;
                transition: all 0.5s ease;
            }
            @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
});