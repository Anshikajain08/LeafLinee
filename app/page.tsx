import { Gatekeeper } from '@/components/Gatekeeper'

export default function Home() {
  return (
    <Gatekeeper>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Redirecting...</h1>
        </div>
      </div>
    </Gatekeeper>
  )
}
