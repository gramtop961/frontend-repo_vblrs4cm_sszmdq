import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Link } from 'react-router-dom'
import Spline from '@splinetool/react-spline'

const apiBase = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function Hero() {
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-sky-900 text-white">
      <div className="absolute inset-0 opacity-60">
        <Spline scene="https://prod.spline.design/qQUip0dJPqrrPryE/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
        <div className="backdrop-blur-sm/50">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Intelligent LinkedIn Lead Automation</h1>
          <p className="mt-4 text-lg md:text-xl text-sky-100 max-w-2xl">
            Safely automate personalized connection requests and follow-ups with human-like timing and a unified inbox.
          </p>
          <div className="mt-8 flex gap-4">
            <a href="#builder" className="bg-sky-500 hover:bg-sky-400 text-white font-semibold px-6 py-3 rounded-md shadow">
              Build a Campaign
            </a>
            <a href="#dashboard" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-md shadow">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-lg p-5 shadow border">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  )
}

function Dashboard({ campaignId }) {
  const [stats, setStats] = useState(null)
  useEffect(() => {
    if (!campaignId) return
    fetch(`${apiBase}/api/campaigns/${campaignId}/stats`).then(r => r.json()).then(setStats)
  }, [campaignId])
  if (!campaignId) return <div className="text-slate-500">Create or select a campaign to see stats.</div>
  if (!stats) return <div className="text-slate-500">Loading stats...</div>
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Stat label="Total Prospects" value={stats.total} />
      <Stat label="Requests Sent" value={stats.requests_sent} />
      <Stat label="Follow-ups" value={stats.followups_sent} />
      <Stat label="Accepted" value={stats.connections_accepted} />
      <Stat label="Replies" value={stats.replies_received} />
      <Stat label="Pending" value={stats.pending} />
    </div>
  )
}

function CampaignBuilder({ onCampaign }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const createCampaign = async () => {
    const res = await fetch(`${apiBase}/api/campaigns`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name, description})})
    const data = await res.json()
    onCampaign(data)
  }
  return (
    <div id="builder" className="bg-white rounded-lg p-6 shadow border space-y-3">
      <div className="text-lg font-semibold">Create a Campaign</div>
      <input className="w-full border rounded px-3 py-2" placeholder="Campaign name" value={name} onChange={e=>setName(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Description (optional)" value={description} onChange={e=>setDescription(e.target.value)} />
      <button onClick={createCampaign} className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded">Create</button>
    </div>
  )
}

function CompanyUploader({ campaignId, onUploaded }) {
  const [file, setFile] = useState(null)
  const upload = async () => {
    if (!file || !campaignId) return
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch(`${apiBase}/api/campaigns/${campaignId}/companies/upload`, { method:'POST', body: fd })
    const data = await res.json()
    onUploaded(data)
  }
  return (
    <div className="bg-white rounded-lg p-6 shadow border space-y-3">
      <div className="text-lg font-semibold">Upload Company CSV</div>
      <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0])} />
      <button onClick={upload} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded">Upload</button>
      <p className="text-sm text-slate-500">Headers: Company Name, Company LinkedIn URL</p>
    </div>
  )
}

function Templates({ campaignId }) {
  const [connection, setConnection] = useState('Hi {{First Name}}, loved what {{Company Name}} is doing — would be great to connect!')
  const [followup, setFollowup] = useState('Hey {{First Name}}, circling back on my request. As {{Job Title}} at {{Company Name}}, would value your perspective. {{Personalized Line}}')
  const save = async () => {
    if (!campaignId) return
    const res = await fetch(`${apiBase}/api/templates`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({campaign_id: campaignId, connection_template: connection, followup_template: followup})})
    await res.json()
  }
  return (
    <div className="bg-white rounded-lg p-6 shadow border space-y-3">
      <div className="text-lg font-semibold">Message Templates</div>
      <textarea className="w-full border rounded px-3 py-2 min-h-[90px]" value={connection} onChange={e=>setConnection(e.target.value)} />
      <textarea className="w-full border rounded px-3 py-2 min-h-[120px]" value={followup} onChange={e=>setFollowup(e.target.value)} />
      <div className="text-sm text-slate-500">Available tags: {'{{First Name}} {{Company Name}} {{Job Title}} {{Personalized Line}}'}</div>
      <button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded">Save Templates</button>
    </div>
  )
}

function ProspectSearch({ campaignId, onLoaded }) {
  const [query, setQuery] = useState('Head of Sales')
  const search = async () => {
    if (!campaignId) return
    await fetch(`${apiBase}/api/campaigns/${campaignId}/prospects/search`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({job_title_query: query})})
    onLoaded()
  }
  return (
    <div className="bg-white rounded-lg p-6 shadow border space-y-3">
      <div className="text-lg font-semibold">Prospect Identification</div>
      <input className="w-full border rounded px-3 py-2" value={query} onChange={e=>setQuery(e.target.value)} />
      <button onClick={search} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded">Search & Generate Prospects</button>
      <p className="text-sm text-slate-500">This demo generates placeholder prospects per company. Production requires LinkedIn API or a compliant third-party service.</p>
    </div>
  )
}

function ProspectTable({ campaignId }) {
  const [items, setItems] = useState([])
  const load = async () => {
    if (!campaignId) return
    const res = await fetch(`${apiBase}/api/campaigns/${campaignId}/prospects`)
    const data = await res.json()
    setItems(data)
  }
  useEffect(() => { load() }, [campaignId])

  return (
    <div className="bg-white rounded-lg p-6 shadow border overflow-x-auto">
      <div className="text-lg font-semibold mb-3">Prospects</div>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-500">
            <th className="py-2 pr-4">Name</th>
            <th className="py-2 pr-4">Company</th>
            <th className="py-2 pr-4">Job Title</th>
            <th className="py-2 pr-4">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map(p => (
            <tr key={p.id} className="border-t">
              <td className="py-2 pr-4">{p.first_name} {p.last_name || ''}</td>
              <td className="py-2 pr-4">{p.company_name}</td>
              <td className="py-2 pr-4">{p.job_title}</td>
              <td className="py-2 pr-4">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={load} className="mt-3 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded">Refresh</button>
    </div>
  )
}

function AutomationControls({ campaignId }) {
  const start = async () => {
    if (!campaignId) return
    await fetch(`${apiBase}/api/automation/start`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({campaign_id: campaignId})})
  }
  return (
    <div className="bg-white rounded-lg p-6 shadow border space-y-3">
      <div className="text-lg font-semibold">Automation Engine</div>
      <p className="text-sm text-slate-500">Simulates connection requests and 3-day follow-ups with randomized scheduling. Stops automatically if a prospect's status is set to "replied".</p>
      <button onClick={start} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-4 py-2 rounded">Run Simulation</button>
    </div>
  )
}

function Inbox() {
  const [items, setItems] = useState([])
  const load = async () => {
    const res = await fetch(`${apiBase}/api/inbox`)
    const data = await res.json()
    setItems(data)
  }
  useEffect(() => { load() }, [])
  return (
    <div className="bg-white rounded-lg p-6 shadow border">
      <div className="text-lg font-semibold mb-3">Smart Inbox</div>
      {items.length === 0 ? (
        <div className="text-slate-500 text-sm">No replies yet. When prospects reply, they will appear here.</div>
      ) : (
        <ul className="divide-y">
          {items.map(x => (
            <li key={x.id} className="py-3">
              <div className="font-medium">{x.first_name} {x.last_name} • {x.company_name}</div>
              <div className="text-slate-500 text-sm">Status: replied</div>
            </li>
          ))}
        </ul>
      )}
      <button onClick={load} className="mt-3 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1 rounded">Refresh</button>
    </div>
  )
}

function App() {
  const [campaign, setCampaign] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Hero />
      <div id="dashboard" className="max-w-6xl mx-auto px-6 py-12 space-y-8 -mt-24 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          <CampaignBuilder onCampaign={setCampaign} />
          <CompanyUploader campaignId={campaign?.id} onUploaded={()=>{}} />
          <Templates campaignId={campaign?.id} />
        </div>

        <Dashboard campaignId={campaign?.id} />

        <div className="grid md:grid-cols-2 gap-6">
          <ProspectSearch campaignId={campaign?.id} onLoaded={()=>{}} />
          <AutomationControls campaignId={campaign?.id} />
        </div>

        <ProspectTable campaignId={campaign?.id} />

        <Inbox />

        <div className="text-xs text-slate-500">
          Note: This is an MVP simulation. For production, the app must integrate with the LinkedIn API or a compliant third-party service. All actions are scheduled with randomized delays and daily limits to mimic human behavior.
        </div>
      </div>
    </div>
  )
}

export default App
