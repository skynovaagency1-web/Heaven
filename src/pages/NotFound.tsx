import { Link } from 'react-router-dom'
import { Mark } from '../components/ui'

export default function NotFound() {
  return (
    <div className="container page-narrow center">
      <span className="pine"><Mark size={56} /></span>
      <h1>This page has checked out</h1>
      <p className="muted">The page you’re looking for doesn’t exist or has moved.</p>
      <Link to="/" className="btn btn--primary mt">Return home</Link>
    </div>
  )
}
