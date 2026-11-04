import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { hydrateAll } from './lib/remoteState'

const root = createRoot(document.getElementById('root'))

const showError = (message) => {
  root.render(
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md bg-white border border-red-200 rounded-xl p-6 shadow-sm text-center">
        <h1 className="text-lg font-bold text-red-700">Cannot connect to the database</h1>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <p className="text-sm text-slate-500 mt-2">Start MongoDB and the backend (<code>npm run dev</code> in the backend folder), then reload.</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    </div>
  )
}

// Stores read their data when imported, so App loads only after MongoDB data is ready.
hydrateAll()
  .then(() => import('./App.jsx'))
  .then(({ default: App }) => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
  .catch((error) => showError(error.message))
