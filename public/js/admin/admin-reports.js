document.addEventListener('DOMContentLoaded', function() {
      
    const reportTypeSelect = document.getElementById('report-type');
    const reportSections = document.querySelectorAll('.report-section');
    
    if (reportTypeSelect) {
        reportTypeSelect.addEventListener('change', function() {
            const selectedReport = this.value;
            
            reportSections.forEach(section => {
                if (section.id === `${selectedReport}-report`) {
                    section.style.display = 'block';
                } else {
                    section.style.display = 'none';
                }
            });
        });
        
          
        reportTypeSelect.dispatchEvent(new Event('change'));
    }
    
      
    const printButton = document.getElementById('print-report');
    if (printButton) {
        printButton.addEventListener('click', function() {
            window.print();
        });
    }
    
      
    const courseFilterInput = document.getElementById('course-filter');
    if (courseFilterInput) {
        const courseItems = document.querySelectorAll('.course-item');
        
        courseFilterInput.addEventListener('input', function() {
            const filterText = this.value.toLowerCase();
            
            courseItems.forEach(item => {
                const courseName = item.querySelector('.course-name').textContent.toLowerCase();
                const courseCode = item.querySelector('.course-code').textContent.toLowerCase();
                
                if (courseName.includes(filterText) || courseCode.includes(filterText)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
      
    const studentFilterInput = document.getElementById('student-filter');
    if (studentFilterInput) {
        const studentItems = document.querySelectorAll('.student-item');
        
        studentFilterInput.addEventListener('input', function() {
            const filterText = this.value.toLowerCase();
            
            studentItems.forEach(item => {
                const studentName = item.querySelector('.student-name').textContent.toLowerCase();
                const studentRoll = item.querySelector('.student-roll').textContent.toLowerCase();
                
                if (studentName.includes(filterText) || studentRoll.includes(filterText)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
    
      
    const exportButton = document.getElementById('export-csv');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            const reportType = reportTypeSelect.value;
            let data = [];
            let headers = [];
            
              
            const activeSection = document.querySelector(`.report-section[style*="display: block"]`);
            if (!activeSection) return;
            
            if (reportType === 'students') {
                headers = ['Student Name', 'Roll Number', 'Department', 'Registered Courses'];
                
                const studentItems = activeSection.querySelectorAll('.student-item:not([style*="display: none"])');
                studentItems.forEach(item => {
                    const name = item.querySelector('.student-name').textContent;
                    const roll = item.querySelector('.student-roll').textContent;
                    const dept = item.querySelector('.student-dept').textContent;
                    const courses = Array.from(item.querySelectorAll('.student-courses li'))
                        .map(li => li.textContent)
                        .join('; ');
                    
                    data.push([name, roll, dept, courses]);
                });
            } else if (reportType === 'courses') {
                headers = ['Course Name', 'Course Code', 'Department', 'Seats Available', 'Registered Students'];
                
                const courseItems = activeSection.querySelectorAll('.course-item:not([style*="display: none"])');
                courseItems.forEach(item => {
                    const name = item.querySelector('.course-name').textContent;
                    const code = item.querySelector('.course-code').textContent;
                    const dept = item.querySelector('.course-dept').textContent;
                    const seats = item.querySelector('.seats-available').textContent;
                    const students = Array.from(item.querySelectorAll('.registered-students li'))
                        .map(li => li.textContent)
                        .join('; ');
                    
                    data.push([name, code, dept, seats, students]);
                });
            } else if (reportType === 'prerequisites') {
                headers = ['Student Name', 'Roll Number', 'Course', 'Missing Prerequisites'];
                
                const prereqItems = activeSection.querySelectorAll('.prereq-item:not([style*="display: none"])');
                prereqItems.forEach(item => {
                    const name = item.querySelector('.student-name').textContent;
                    const roll = item.querySelector('.student-roll').textContent;
                    const course = item.querySelector('.course-name').textContent;
                    const missing = Array.from(item.querySelectorAll('.missing-prereqs li'))
                        .map(li => li.textContent)
                        .join('; ');
                    
                    data.push([name, roll, course, missing]);
                });
            }
            
            if (data.length > 0) {
                exportToCSV(data, headers, `${reportType}-report.csv`);
            }
        });
    }
    
    function exportToCSV(data, headers, filename) {
        let csvContent = "data:text/csv;charset=utf-8,";
        
          
        csvContent += headers.join(',') + '\n';
        
          
        data.forEach(row => {
              
            const processedRow = row.map(value => {
                if (value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            
            csvContent += processedRow.join(',') + '\n';
        });
        
          
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});