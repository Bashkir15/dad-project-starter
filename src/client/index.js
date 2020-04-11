function initApp() {
    const root = document.getElementById('home')
    const node = document.createElement('div')
    node.innerHTML = '<p>Stuff and more stuff</p>'
    root.appendChild(node)
}

initApp()