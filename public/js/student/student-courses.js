document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const courseList = document.getElementById('course-list');
    const tempScheduleList = document.getElementById('temp-schedule-list');
    const clearTempBtn = document.getElementById('clear-temp');
    const submitScheduleBtn = document.getElementById('submit-schedule');
    const prereqInfoPanel = document.getElementById('prerequisites-info');
    const sidePanel = document.getElementById('side-panel');
    const viewScheduleBtn = document.getElementById('view-schedule-btn');
    const courseDetailsPanel = document.getElementById('course-details-panel');
    const closeDetailsBtn = document.getElementById('close-details');
    const courseCount = document.getElementById('course-count');
    
    // Filter elements
    const departmentFilter = document.getElementById('department-filter');
    const levelFilter = document.getElementById('level-filter');
    const dayFilter = document.getElementById('day-filter');
    const timeFilter = document.getElementById('time-filter');
    const seatsFilter = document.getElementById('seats-filter');
    const searchFilter = document.getElementById('search-filter');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    // Modal elements
    const modalContainer = document.getElementById('modal-container');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const modalConfirmBtn = document.getElementById('modal-confirm');
    const modalCancelBtn = document.getElementById('modal-cancel');
    const closeModalBtn = document.getElementById('close-modal');
    
    // Store original courses for filtering
    let originalCourses = [];
    if (courseList) {
        originalCourses = Array.from(courseList.children);
    }
    
    // Initialize temporary schedule
    let temporarySchedule = [];
    let temporaryCourseObjects = [];
    
    // Load temporary schedule from server
    loadTemporarySchedule();
    
    // Event Listeners
    if (viewScheduleBtn) {
        viewScheduleBtn.addEventListener('click', toggleSidePanel);
    }
    
    if (closeDetailsBtn) {
        closeDetailsBtn.addEventListener('click', function() {
            if (courseDetailsPanel) {
                courseDetailsPanel.style.display = 'none';
            }
        });
    }
    
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    if (searchFilter) {
        searchFilter.addEventListener('input', function(e) {
            // Real-time search filtering
            if (e.target.value.length >= 2 || e.target.value.length === 0) {
                applyFilters();
            }
        });
    }
    
    // Add course to temporary schedule
    if (courseList) {
        courseList.addEventListener('click', function(e) {
            if (e.target.classList.contains('add-temp-btn') && !e.target.disabled) {
                const courseId = e.target.getAttribute('data-course-id');
                addToTemporarySchedule(courseId);
                e.target.textContent = 'Added';
                e.target.disabled = true;
            } else if (e.target.classList.contains('info-btn')) {
                const courseId = e.target.getAttribute('data-course-id');
                showCourseDetails(courseId);
            }
        });
    }
    
    // Remove course from temporary schedule
    if (tempScheduleList) {
        tempScheduleList.addEventListener('click', function(e) {
            if (e.target.classList.contains('remove-temp-btn')) {
                const courseId = e.target.getAttribute('data-course-id');
                removeFromTemporarySchedule(courseId);
                
                // Re-enable "Add" button in course list
                const addBtn = document.querySelector(`.add-temp-btn[data-course-id="${courseId}"]`);
                if (addBtn) {
                    addBtn.textContent = 'Add to Schedule';
                    addBtn.disabled = false;
                }
            }
        });
    }
    
    // Clear temporary schedule
    if (clearTempBtn) {
        clearTempBtn.addEventListener('click', function() {
            showConfirmationModal(
                'Clear Selection', 
                'Are you sure you want to clear all selected courses?',
                clearTemporarySchedule
            );
        });
    }
    
    // Submit registration
    if (submitScheduleBtn) {
        submitScheduleBtn.addEventListener('click', function() {
            if (!temporarySchedule.length) {
                showModal('No Courses Selected', 'Please select at least one course before confirming registration.');
                return;
            }
            
            showConfirmationModal(
                'Confirm Registration', 
                `You're about to register for ${temporarySchedule.length} course(s). Continue?`,
                submitRegistration
            );
        });
    }
    
    // Modal event listeners
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    if (modalCancelBtn) {
        modalCancelBtn.addEventListener('click', hideModal);
    }
    
    // Functions
    function loadTemporarySchedule() {
        fetch('/student/temp-schedule')
            .then(response => response.json())
            .then(data => {
                if (data.courses && data.courses.length > 0) {
                    temporarySchedule = data.courses.map(course => course._id);
                    temporaryCourseObjects = data.courses;
                    updateTempScheduleUI(data.courses);
                    updateAddButtons();
                }
            })
            .catch(error => console.error('Error loading temporary schedule:', error));
    }
    
    function addToTemporarySchedule(courseId) {
        fetch('/student/add-to-temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    temporarySchedule = data.temporarySchedule;
                    // Refresh the UI
                    loadTemporarySchedule();
                    
                    // Show the side panel
                    sidePanel.classList.add('show');
                }
            })
            .catch(error => console.error('Error adding to temporary schedule:', error));
    }
    
    function removeFromTemporarySchedule(courseId) {
        fetch('/student/remove-from-temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    temporarySchedule = data.temporarySchedule;
                    // Refresh the UI
                    loadTemporarySchedule();
                }
            })
            .catch(error => console.error('Error removing from temporary schedule:', error));
    }
    
    function clearTemporarySchedule() {
        fetch('/student/remove-from-temp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ clearAll: true }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    temporarySchedule = [];
                    temporaryCourseObjects = [];
                    updateTempScheduleUI([]);
                    updateAddButtons();
                    hideModal();
                }
            })
            .catch(error => console.error('Error clearing temporary schedule:', error));
    }
    
    // Find the submitRegistration function and update it:

function submitRegistration() {
    fetch('/student/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => response.json())
        .then(data => {
            hideModal();
            
            if (data.success) {
                showModal('Registration Successful', 'Your course registration has been completed successfully!', function() {
                    window.location.href = '/student/dashboard';
                });
            } else {
                if (data.conflicts) {
                    let conflictMessage = 'The following course conflicts were detected:<ul>';
                    data.conflicts.forEach(conflict => {
                        conflictMessage += `<li>${conflict.course1} conflicts with ${conflict.course2}</li>`;
                    });
                    conflictMessage += '</ul>Please resolve these conflicts before continuing.';
                    
                    showModal('Schedule Conflicts', conflictMessage);
                } else if (data.missingPrerequisites) {
                    let prereqMessage = 'You cannot register for the following courses because you haven\'t completed the prerequisites:<ul>';
                    data.missingPrerequisites.forEach(item => {
                        prereqMessage += `<li><strong>${item.course}</strong> requires <strong>${item.prerequisite}</strong></li>`;
                    });
                    prereqMessage += '</ul>You need to complete these prerequisites first.';
                    
                    showModal('Missing Prerequisites', prereqMessage);
                } else {
                    showModal('Registration Failed', data.message || 'There was a problem with your registration.');
                }
            }
        })
        .catch(error => {
            console.error('Error submitting registration:', error);
            showModal('Error', 'An unexpected error occurred. Please try again later.');
        });
}
    
    function updateTempScheduleUI(courses) {
        if (!tempScheduleList) return;
        
        tempScheduleList.innerHTML = '';
        
        if (!courses || courses.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'empty-message';
            emptyItem.textContent = 'No courses selected';
            tempScheduleList.appendChild(emptyItem);
            return;
        }
        
        courses.forEach(course => {
            const li = document.createElement('li');
            
            const courseInfo = document.createElement('div');
            courseInfo.className = 'course-info';
            courseInfo.innerHTML = `
                <div class="course-name">${course.name}</div>
                <div class="course-details">${course.code} · ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][course.schedule.day]} ${course.schedule.startTime}:00</div>
            `;
            
            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.className = 'remove-temp-btn';
            removeBtn.setAttribute('data-course-id', course._id);
            
            li.appendChild(courseInfo);
            li.appendChild(removeBtn);
            tempScheduleList.appendChild(li);
        });
    }
    
    // Find the function that displays course details and add:

function showCourseDetails(courseId) {
    fetch(`/api/courses/${courseId}`)
        .then(response => response.json())
        .then(course => {
            if (prereqInfoPanel) {
                const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
                
                let detailsHTML = `
                    <h4>${course.name} (${course.code})</h4>
                    <div class="course-full-details">
                        <p><strong>Department:</strong> ${course.department}</p>
                        <p><strong>Credit Hours:</strong> ${course.creditHours}</p>
                        <p><strong>Schedule:</strong> ${dayNames[course.schedule.day]}, 
                           ${course.schedule.startTime}:00 - ${course.schedule.startTime + 1}:00</p>
                        <p><strong>Available Seats:</strong> ${course.seatsAvailable} / ${course.totalSeats}</p>
                        ${course.description ? `<p><strong>Description:</strong> ${course.description}</p>` : ''}
                    </div>
                `;
                
                // Add prerequisites with more noticeable styling
                if (course.prerequisites && course.prerequisites.length > 0) {
                    detailsHTML += `
                        <div class="prerequisites-section">
                            <h5 class="prereq-heading">⚠️ Prerequisites Required</h5>
                            <p>You must complete these courses before enrolling:</p>
                            <ul class="prereq-list">
                    `;
                    course.prerequisites.forEach(prereq => {
                        detailsHTML += `<li>${prereq.name} (${prereq.code})</li>`;
                    });
                    detailsHTML += '</ul></div>';
                } else {
                    detailsHTML += '<p><em>No prerequisites required</em></p>';
                }
                
                prereqInfoPanel.innerHTML = detailsHTML;
                
                // Show the course details panel
                if (courseDetailsPanel) {
                    courseDetailsPanel.style.display = 'block';
                }
                
                // Show the side panel if it's not already visible
                sidePanel.classList.add('show');
            }
        })
        .catch(error => console.error('Error fetching course details:', error));
}
    
    function applyFilters() {
        let filteredCourses = [...originalCourses];
        
        // Apply department filter
        if (departmentFilter && departmentFilter.value) {
            filteredCourses = filteredCourses.filter(course => {
                const deptElement = course.querySelector('.course-department');
                return deptElement && deptElement.textContent === departmentFilter.value;
            });
        }
        
        // Apply level filter
        if (levelFilter && levelFilter.value) {
            const level = parseInt(levelFilter.value);
            filteredCourses = filteredCourses.filter(course => {
                const codeElement = course.querySelector('.course-code');
                if (codeElement) {
                    const match = codeElement.textContent.match(/\d+/);
                    if (match) {
                        const courseLevel = Math.floor(parseInt(match[0]) / 100) * 100;
                        return courseLevel === level;
                    }
                }
                return false;
            });
        }
        
        // Apply day filter
        if (dayFilter && dayFilter.value !== '') {
            const day = parseInt(dayFilter.value);
            filteredCourses = filteredCourses.filter(course => {
                const scheduleElement = course.querySelector('.course-schedule');
                if (scheduleElement) {
                    return scheduleElement.dataset.day === dayFilter.value;
                }
                return false;
            });
        }
        
        // Apply time filter
        if (timeFilter && timeFilter.value) {
            const timeRange = timeFilter.value;
            filteredCourses = filteredCourses.filter(course => {
                const timeElement = course.querySelector('.course-time');
                if (timeElement) {
                    const startTime = parseInt(timeElement.dataset.startTime);
                    if (timeRange === 'morning' && startTime >= 8 && startTime < 12) {
                        return true;
                    } else if (timeRange === 'afternoon' && startTime >= 12 && startTime < 17) {
                        return true;
                    } else if (timeRange === 'evening' && startTime >= 17) {
                        return true;
                    }
                }
                return false;
            });
        }
        
        // Apply seats filter
        if (seatsFilter && seatsFilter.checked) {
            filteredCourses = filteredCourses.filter(course => {
                const seatsElement = course.querySelector('.seats-available');
                if (seatsElement) {
                    return parseInt(seatsElement.textContent) > 0;
                }
                return false;
            });
        }
        
        // Apply search filter
        if (searchFilter && searchFilter.value.trim()) {
            const searchTerm = searchFilter.value.trim().toLowerCase();
            filteredCourses = filteredCourses.filter(course => {
                const nameElement = course.querySelector('.course-name');
                const codeElement = course.querySelector('.course-code');
                const deptElement = course.querySelector('.course-department');
                
                if (nameElement && nameElement.textContent.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (codeElement && codeElement.textContent.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                if (deptElement && deptElement.textContent.toLowerCase().includes(searchTerm)) {
                    return true;
                }
                
                return false;
            });
        }
        
        // Update course count
        if (courseCount) {
            courseCount.textContent = filteredCourses.length;
        }
        
        // Display filtered courses
        displayCourses(filteredCourses);
    }
    
    function resetFilters() {
        // Reset all filter controls
        if (departmentFilter) departmentFilter.value = '';
        if (levelFilter) levelFilter.value = '';
        if (dayFilter) dayFilter.value = '';
        if (timeFilter) timeFilter.value = '';
        if (seatsFilter) seatsFilter.checked = false;
        if (searchFilter) searchFilter.value = '';
        
        // Show all courses
        displayCourses(originalCourses);
        
        // Update course count
        if (courseCount) {
            courseCount.textContent = originalCourses.length;
        }
    }
    
    function displayCourses(courses) {
        if (!courseList) return;
        
        courseList.innerHTML = '';
        
        if (courses.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-state';
            emptyMessage.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No courses match your filters</h3>
                <p>Try adjusting your filter criteria or click "Reset Filters"</p>
            `;
            courseList.appendChild(emptyMessage);
            return;
        }
        
        courses.forEach(course => {
            courseList.appendChild(course.cloneNode(true));
        });
        
        // Update add buttons
        updateAddButtons();
    }
    
    function updateAddButtons() {
        if (!courseList) return;
        
        const addButtons = courseList.querySelectorAll('.add-temp-btn');
        
        addButtons.forEach(button => {
            const courseId = button.getAttribute('data-course-id');
            if (temporarySchedule.includes(courseId)) {
                button.textContent = 'Added';
                button.disabled = true;
            } else {
                button.textContent = 'Add to Schedule';
                button.disabled = false;
            }
        });
    }
    
    function toggleSidePanel() {
        if (sidePanel) {
            sidePanel.classList.toggle('show');
        }
    }
    
    function showModal(title, message, callback) {
        if (!modalContainer) return;
        
        modalTitle.textContent = title;
        modalContent.innerHTML = message;
        
        // Hide confirm button for info modals
        if (callback) {
            modalConfirmBtn.style.display = 'inline-block';
            modalConfirmBtn.onclick = function() {
                hideModal();
                callback();
            };
        } else {
            modalConfirmBtn.style.display = 'none';
        }
        
        modalCancelBtn.textContent = 'Close';
        modalContainer.classList.add('show');
    }
    
    function showConfirmationModal(title, message, confirmCallback) {
        if (!modalContainer) return;
        
        modalTitle.textContent = title;
        modalContent.innerHTML = message;
        
        modalConfirmBtn.style.display = 'inline-block';
        modalConfirmBtn.textContent = 'Confirm';
        modalConfirmBtn.onclick = confirmCallback;
        
        modalCancelBtn.textContent = 'Cancel';
        modalContainer.classList.add('show');
    }
    
    function hideModal() {
        if (modalContainer) {
            modalContainer.classList.remove('show');
        }
    }
});