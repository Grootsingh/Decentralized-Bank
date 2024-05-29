'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { WagmiProvider, type State } from 'wagmi'
import { RecoilRoot } from 'recoil'
import { config } from '@/wagmi'

export function Providers(props: { children: ReactNode,  initialState: State | undefined }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <RecoilRoot>
    <WagmiProvider config={config} initialState={props.initialState}>
      <QueryClientProvider client={queryClient}>
        {props.children}
      </QueryClientProvider>
    </WagmiProvider>
    </RecoilRoot>
  )
}
