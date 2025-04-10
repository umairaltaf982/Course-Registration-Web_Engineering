  

document.addEventListener('DOMContentLoaded', function() {
      
    const studentSearch = document.getElementById('student-search');
    const departmentFilter = document.getElementById('department-filter');
    const semesterFilter = document.getElementById('semester-filter');
    const studentCards = document.querySelectorAll('.student-card');
    const confirmationModal = document.getElementById('confirmation-modal');
    const confirmActionBtn = document.getElementById('confirm-action');
    const cancelActionBtn = document.getElementById('cancel-action');
    const closeModalBtn = document.querySelector('.close-modal');
    const alertCloseButtons = document.querySelectorAll('.close-alert');
    
      
    let activeForm = null;
    
      
    if (studentSearch) {
        studentSearch.addEventListener('input', filterStudents);
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', filterStudents);
    }
    
    if (semesterFilter) {
        semesterFilter.addEventListener('change', filterStudents);
    }
    
      
    const removeForms = document.querySelectorAll('.remove-course-form');
    removeForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            activeForm = this;
            showModal();
        });
    });
    
      
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideModal);
    }
    
    if (cancelActionBtn) {
        cancelActionBtn.addEventListener('click', hideModal);
    }
    
    if (confirmActionBtn) {
        confirmActionBtn.addEventListener('click', confirmRemoveCourse);
    }
    
      
    window.addEventListener('click', function(e) {
        if (e.target === confirmationModal) {
            hideModal();
        }
    });
    
      
    if (alertCloseButtons) {
        alertCloseButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.alert').style.display = 'none';
            });
        });
    }
    
      
    function filterStudents() {
        const searchTerm = studentSearch ? studentSearch.value.toLowerCase() : '';
        const department = departmentFilter ? departmentFilter.value : '';
        const semester = semesterFilter ? semesterFilter.value : '';
        
        studentCards.forEach(card => {
            const studentName = card.dataset.name.toLowerCase();
            const studentRoll = card.dataset.rollno.toLowerCase();
            const studentDept = card.dataset.dept;
            const studentSemester = card.dataset.semester;
            
              
            let nameMatch = !searchTerm || 
                studentName.includes(searchTerm) || 
                studentRoll.includes(searchTerm);
                
            let deptMatch = !department || 
                studentDept === department;
                
            let semesterMatch = !semester || 
                studentSemester === semester;
            
            if (nameMatch && deptMatch && semesterMatch) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
          
        checkForEmptyResults();
    }
    
    function checkForEmptyResults() {
        const studentGrid = document.querySelector('.student-grid');
        if (!studentGrid) return;
        
        let visibleCards = 0;
        
        studentCards.forEach(card => {
            if (card.style.display !== 'none') {
                visibleCards++;
            }
        });
        
          
        let emptyResults = studentGrid.querySelector('.empty-results');
        
        if (visibleCards === 0) {
            if (!emptyResults) {
                emptyResults = document.createElement('div');
                emptyResults.className = 'empty-state empty-results';
                emptyResults.innerHTML = `
                    <div class="empty-icon">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3>No Students Found</h3>
                    <p>No students match your current filters.</p>
                    <button id="reset-filters" class="btn secondary-btn">
                        <i class="fas fa-undo"></i> Reset Filters
                    </button>
                `;
                studentGrid.appendChild(emptyResults);
                
                  
                const resetBtn = emptyResults.querySelector('#reset-filters');
                if (resetBtn) {
                    resetBtn.addEventListener('click', resetFilters);
                }
            }
        } else if (emptyResults) {
              
            emptyResults.remove();
        }
    }
    
    function resetFilters() {
        if (studentSearch) studentSearch.value = '';
        if (departmentFilter) departmentFilter.value = '';
        if (semesterFilter) semesterFilter.value = '';
        
        filterStudents();
    }
    
    function showModal() {
        if (confirmationModal) {
            confirmationModal.style.display = 'flex';
        }
    }
    
    function hideModal() {
        if (confirmationModal) {
            confirmationModal.style.display = 'none';
            activeForm = null;
        }
    }
    
    function confirmRemoveCourse() {
        if (activeForm) {
              
            confirmActionBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Removing...';
            confirmActionBtn.disabled = true;
            
              
            activeForm.submit();
        }
    }
});