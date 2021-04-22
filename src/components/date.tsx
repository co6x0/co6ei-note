import { parseISO, format } from 'date-fns'

type Props = {
  dateString: string
}

export const Date: React.VFC<Props> = ({ dateString }) => {
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'LLLL d, yyyy')}</time>
}
