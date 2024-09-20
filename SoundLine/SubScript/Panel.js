document.addEventListener('DOMContentLoaded', () => {
    const queueButton = document.getElementById('queue-button');
    const sidePanel = document.getElementById('side-panel');
    const closeSidePanelButton = document.getElementById('close-side-panel');

  
    queueButton.addEventListener('click', () => {
        sidePanel.classList.add('open');
    });

  
    closeSidePanelButton.addEventListener('click', () => {
        sidePanel.classList.remove('open');
    });
});