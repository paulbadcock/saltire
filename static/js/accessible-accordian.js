(function() {
  const headings = document.querySelectorAll('h2')

  Array.prototype.forEach.call(headings, heading => {
    let btn = heading.querySelector('button')
    let target = heading.nextElementSibling

    btn.onclick = () => {
      let expanded = btn.getAttribute('aria-expanded') === 'true' || false

      btn.setAttribute('aria-expanded', !expanded)
      target.hidden = expanded
    }
  })
})()
