# Contact Form Button Styling Reference

## Button Styling Details

### WhatsApp Button
```
Colors:
  - Default: Linear gradient #25d366 → #1fa855 (Green)
  - Hover: Darker green gradient + 3px lift + enhanced shadow
  - Active: 1px lift (subtle)

Typography:
  - Font Weight: 700 (Bold)
  - Font Size: 0.95rem
  - Text Transform: UPPERCASE
  - Letter Spacing: 0.5px
  - Color: White

Spacing:
  - Padding: 0.85rem 1.8rem
  - Gap between icon and text: 0.6rem
  - Border Radius: var(--radius-lg)

Effects:
  - Transition: all 0.3s ease
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.2)
  - Hover Transform: translateY(-3px)
  - Hover Shadow: 0 6px 16px rgba(37,211,102,0.5)
  - Active Transform: translateY(-1px)
```

### Call Button
```
Colors:
  - Default: Linear gradient #007AFF → #0051d5 (Blue)
  - Hover: Darker blue gradient + 3px lift + enhanced shadow
  - Active: 1px lift (subtle)

Typography:
  - Font Weight: 700 (Bold)
  - Font Size: 0.95rem
  - Text Transform: UPPERCASE
  - Letter Spacing: 0.5px
  - Color: White

Spacing:
  - Padding: 0.85rem 1.8rem
  - Gap between icon and text: 0.6rem
  - Border Radius: var(--radius-lg)

Effects:
  - Transition: all 0.3s ease
  - Box Shadow: 0 2px 8px rgba(0,0,0,0.2)
  - Hover Transform: translateY(-3px)
  - Hover Shadow: 0 6px 16px rgba(0,122,255,0.5)
  - Active Transform: translateY(-1px)
```

## CSS Code

```css
/* Mobile Contact Options Container */
.mobile-contact-options {
  display: none;
  gap: 1rem;
  margin-top: var(--space-lg);
  justify-content: center;
}

/* Base Button Styling */
.mobile-contact-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.85rem 1.8rem;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 700;
  font-size: 0.95rem;
  transition: all var(--transition-base);
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Icon Styling */
.contact-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}

/* WhatsApp Button */
.mobile-contact-btn.whatsapp {
  background: linear-gradient(135deg, #25d366 0%, #1fa855 100%);
  color: white;
}

.mobile-contact-btn.whatsapp:hover {
  background: linear-gradient(135deg, #1fa855 0%, #188c4a 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(37, 211, 102, 0.5);
}

.mobile-contact-btn.whatsapp:active {
  transform: translateY(-1px);
}

/* Call Button */
.mobile-contact-btn.phone {
  background: linear-gradient(135deg, #007AFF 0%, #0051d5 100%);
  color: white;
}

.mobile-contact-btn.phone:hover {
  background: linear-gradient(135deg, #0051d5 0%, #003a9f 100%);
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 122, 255, 0.5);
}

.mobile-contact-btn.phone:active {
  transform: translateY(-1px);
}

/* Mobile Display */
@media (max-width: 768px) {
  .mobile-contact-options {
    display: flex;
  }
}
```

## HTML Structure

```html
<div class="mobile-contact-options">
  <!-- WhatsApp Button -->
  <a href="https://wa.me/21625200688" 
     class="mobile-contact-btn whatsapp" 
     aria-label="Contact via WhatsApp">
    <img src="assets/img/Whatsapp.png" 
         alt="WhatsApp" 
         class="contact-icon">
    <span>WhatsApp</span>
  </a>

  <!-- Call Button -->
  <a href="tel:+21625200688" 
     class="mobile-contact-btn phone" 
     aria-label="Call us">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
    </svg>
    <span>Call</span>
  </a>
</div>
```

## Color Codes Reference

| Component | Color | Hex |
|-----------|-------|-----|
| WhatsApp Primary | Green | #25d366 |
| WhatsApp Secondary | Dark Green | #1fa855 |
| WhatsApp Tertiary | Darker Green | #188c4a |
| WhatsApp Shadow | Green (40% opacity) | rgba(37, 211, 102, 0.5) |
| Call Primary | Blue | #007AFF |
| Call Secondary | Dark Blue | #0051d5 |
| Call Tertiary | Darker Blue | #003a9f |
| Call Shadow | Blue (50% opacity) | rgba(0, 122, 255, 0.5) |
| Base Shadow | Black (20% opacity) | rgba(0, 0, 0, 0.2) |

## Responsive Behavior

- **Desktop (> 768px):** Contact buttons hidden
- **Mobile (≤ 768px):** Contact buttons visible in full width flex layout
- **Buttons Stack:** Both buttons take equal space in mobile view
- **Touch Friendly:** 0.85rem × 1.8rem padding ensures good touch targets

## Animation Timing

- Default transition: 0.3s ease
- Hover lift: 3px upward
- Active state: 1px upward (subtle feedback)
- All transitions use CSS `transform` for smooth 60fps performance

## Accessibility

✅ Proper `aria-label` attributes for screen readers  
✅ High contrast ratios (white text on colored backgrounds)  
✅ Focus states properly defined  
✅ Semantic HTML (anchor tags with href for real links)  
✅ Touch-friendly sizing (min 44px × 44px recommended)  

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ CSS Gradients (IE 10+)
- ✅ Flexbox (IE 11+)
- ✅ CSS Transform (IE 10+)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
