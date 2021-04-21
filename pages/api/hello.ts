// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default (res: any) => {
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
