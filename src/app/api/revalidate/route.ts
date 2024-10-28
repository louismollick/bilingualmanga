import { revalidatePath } from 'next/cache'
import { type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get('path')

  if (!path) {
    return Response.json({ error: 'path is required' }, { status: 500 })
  }

  revalidatePath(path)

  return Response.json({ message: `Successfully revalidated path: ${path}` })
}