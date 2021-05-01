import useSWR from 'swr'

export const useOgp = (url: string) => {
  const fetcher = (url: string) => {
    fetch(`http://localhost:3000/api/getOgp?url=${url}`).then((res) =>
      res.json()
    )
  }
  const { data, error } = useSWR(url, fetcher)

  return {
    data: data,
    isLoading: !error && !data,
    isError: error,
  }
}
