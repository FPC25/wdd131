const visitsDisplay = document.querySelector("#visits");

if (visitsDisplay) {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get current count
    let numVisits = Number(window.localStorage.getItem("numVisits-ls")) || 0;
    
    // Check if this is a form submission
    if (urlParams.toString()) {
        const submissionId = urlParams.get('submissionId');
        const lastSubmissionId = sessionStorage.getItem("lastSubmissionId");
        
        // Only count if this is a different submission ID
        if (submissionId && submissionId !== lastSubmissionId) {
            numVisits++;
            window.localStorage.setItem("numVisits-ls", numVisits);
            sessionStorage.setItem("lastSubmissionId", submissionId);
        }
    }
    
    // Display the count
    visitsDisplay.textContent = `${numVisits} successful submission(s) so far.`;
}