import React, { useState } from 'react'

export default function Prueba() {
  const [count, setCount] = useState(0)
  const [msg, setMsg] = useState('')

  function handleClick() {
    const next = count + 1
    setCount(next)
    setMsg(`Has hecho clic ${next} ${next === 1 ? 'vez' : 'veces'}`)
  }

  return (
    <div style={{ padding: 12, border: '1px solid #e0e0e0', borderRadius: 6, maxWidth: 420 }}>
      <h2>Componente de Prueba</h2>
      <p>Este componente es una prueba rápida dentro de la página de Historias Clínicas.</p>
      <button onClick={handleClick} style={{ padding: '8px 12px' }}>Hazme clic</button>
      {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
    </div>
  )
}
