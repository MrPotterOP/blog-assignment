import { revalidatePath } from 'next/cache';

export async function POST(req) {
    const { path } = await req.json();

    if (!path) {
        return Response.json({ error: 'Path is required' }, { status: 400 });
    }
    revalidatePath(path);
    console.log(`Revalidated path: ${path}`);
    return Response.json({ revalidated: true });
}