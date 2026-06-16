/**
 * MOBILE NAV MENU
 *
 * On narrow viewports, the primary menu collapses behind a burger button.
 * This script toggles the menu open and closed, and keeps `aria-expanded`
 * in sync with the state.
 *
 * Wrapped in a block so its `const`/`let` bindings stay local: the build
 * concatenates every `src/js/*.js` into one `site.js`, and block scope keeps
 * these files from colliding without needing an IIFE.
 */
{
  const init = () => {
    const toggle = document.querySelector('.NavBar__Toggle')
    const menu = document.getElementById('nav-menu')

    if (!toggle || !menu) return

    const navbar = toggle.closest('.NavBar')

    const setOpen = (open) => {
      menu.classList.toggle('is-open', open)
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false')
    }

    toggle.addEventListener('click', () => {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true')
    })

    /* Close after a menu link is chosen. */
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) setOpen(false)
    })

    /* Close on Escape, returning focus to the button. */
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false)
        toggle.focus()
      }
    })

    /* Close when focus or a click moves outside the bar. */
    document.addEventListener('click', (event) => {
      if (navbar && !navbar.contains(event.target)) setOpen(false)
    })

    /* Close when the viewport widens to the desktop breakpoint. */
    window
      .matchMedia('(min-width: 800px)')
      .addEventListener('change', (event) => {
        if (event.matches) setOpen(false)
      })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
}
