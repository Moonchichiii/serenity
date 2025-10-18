/**
 * Custom Wagtail Admin JavaScript for Client Simplicity
 * Adds helpful tooltips and simplifies complex features
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // ADD HELPFUL TOOLTIPS
    // ============================================

    // Add tooltip to Publish button
    const publishButton = document.querySelector('.action-save');
    if (publishButton) {
        publishButton.setAttribute('title', 'Click to save and make your changes live on the website');
    }

    // Add tooltip to image chooser
    const imageChoosers = document.querySelectorAll('.image-chooser button');
    imageChoosers.forEach(button => {
        if (button.textContent.includes('Choose')) {
            button.setAttribute('title', 'Select an image from your uploaded images');
        }
    });

    // ============================================
    // SIMPLIFY RICH TEXT EDITOR
    // ============================================

    // Hide advanced formatting buttons in rich text editor
    const advancedButtons = [
        'blockquote',
        'code',
        'strikethrough',
        'superscript',
        'subscript',
        'embed',
    ];

    advancedButtons.forEach(buttonName => {
        const buttons = document.querySelectorAll(`[data-draftail-type="${buttonName}"]`);
        buttons.forEach(button => {
            button.style.display = 'none';
        });
    });

    // ============================================
    // ADD CONFIRMATION FOR DANGEROUS ACTIONS
    // ============================================

    // Confirm before deleting images
    const deleteButtons = document.querySelectorAll('[name="action-delete"]');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this? This cannot be undone.')) {
                e.preventDefault();
                return false;
            }
        });
    });

    // ============================================
    // AUTO-SAVE REMINDER
    // ============================================

    let formChanged = false;
    const form = document.querySelector('form');

    if (form) {
        // Track if form has been modified
        form.addEventListener('input', function() {
            formChanged = true;
        });

        // Warn if leaving without saving
        window.addEventListener('beforeunload', function(e) {
            if (formChanged && !document.querySelector('.action-save')?.classList.contains('submitted')) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Reset flag when saving
        const saveButtons = document.querySelectorAll('.action-save');
        saveButtons.forEach(button => {
            button.addEventListener('click', function() {
                formChanged = false;
                this.classList.add('submitted');
            });
        });
    }

    // ============================================
    // HELPFUL WELCOME MESSAGE
    // ============================================

    // Add quick tips on dashboard
    const dashboard = document.querySelector('.homepage');
    if (dashboard && !sessionStorage.getItem('serenity_tips_shown')) {
        const tips = document.createElement('div');
        tips.className = 'serenity-tips';
        tips.style.cssText = `
            background: linear-gradient(135deg, #dce5df 0%, #ede7e1 100%);
            border: 2px solid #6d9177;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 4px 12px rgba(109, 145, 119, 0.15);
        `;

        tips.innerHTML = `
            <h2 style="margin-top: 0; color: #2e2e2e; font-size: 24px;">
                🌿 Welcome to Serenity CMS
            </h2>
            <p style="font-size: 16px; color: #2e2e2e; margin-bottom: 12px;">
                <strong>Quick Tips:</strong>
            </p>
            <ul style="font-size: 15px; color: #2e2e2e; line-height: 1.8;">
                <li><strong>Pages</strong> → Edit your homepage text and hero image</li>
                <li><strong>Images</strong> → Upload and manage all your photos</li>
                <li><strong>Snippets</strong> → Add/edit services and testimonials</li>
                <li>Always click <strong>"Publish"</strong> to make changes live</li>
            </ul>
            <button
                onclick="this.parentElement.remove(); sessionStorage.setItem('serenity_tips_shown', 'true');"
                style="
                    background: #6d9177;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    margin-top: 10px;
                "
            >
                Got it! ✓
            </button>
        `;

        dashboard.insertBefore(tips, dashboard.firstChild);
    }

    // ============================================
    // SIMPLIFY IMAGE UPLOAD
    // ============================================

    // Add drag-and-drop visual feedback
    const imageFields = document.querySelectorAll('.image-chooser');
    imageFields.forEach(field => {
        const dropzone = field.querySelector('.image-chooser__preview');
        if (dropzone) {
            dropzone.style.border = '3px dashed #dce5df';
            dropzone.style.transition = 'all 0.3s ease';

            dropzone.addEventListener('dragover', function(e) {
                e.preventDefault();
                this.style.borderColor = '#6d9177';
                this.style.backgroundColor = '#f6f8f7';
            });

            dropzone.addEventListener('dragleave', function() {
                this.style.borderColor = '#dce5df';
                this.style.backgroundColor = 'transparent';
            });

            dropzone.addEventListener('drop', function() {
                this.style.borderColor = '#6d9177';
                this.style.backgroundColor = 'transparent';
            });
        }
    });

    // ============================================
    // KEYBOARD SHORTCUTS HINT
    // ============================================

    // Show keyboard shortcuts on first load
    if (!sessionStorage.getItem('serenity_shortcuts_shown')) {
        console.log(`
╔════════════════════════════════════════╗
║   🌿 Serenity CMS Keyboard Shortcuts  ║
╠════════════════════════════════════════╣
║  Ctrl+S  →  Save draft                ║
║  Ctrl+P  →  Publish changes           ║
║  Ctrl+Z  →  Undo                      ║
╚════════════════════════════════════════╝
        `);
        sessionStorage.setItem('serenity_shortcuts_shown', 'true');
    }

    // Implement Ctrl+S to save
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveButton = document.querySelector('.action-save');
            if (saveButton) {
                saveButton.click();
            }
        }
    });

});
