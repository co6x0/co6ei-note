import dayjs from 'dayjs'

type Props = {
  dateString: string
}

export const PostDate: React.VFC<Props> = ({ dateString }) => {
  const date = dayjs(dateString).toISOString()
  return <time dateTime={date}>{dayjs(dateString).format('YYYY-MM-DD')}</time>
}
