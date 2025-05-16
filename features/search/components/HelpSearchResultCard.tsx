'use client'

import React from 'react'
import Link from 'next/link'
import { CircleHelp, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchResult } from '../types/search-types'

interface HelpSearchResultCardProps {
  result: SearchResult
}

/**
 * A specialized card for displaying help search results
 */
export function HelpSearchResultCard({ result }: HelpSearchResultCardProps) {
  // Extract metadata
  const category = result.category || result.metadata?.category || 'Help'
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CircleHelp className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{result.title}</CardTitle>
          </div>
          <Badge variant="outline">{category}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{result.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="text-sm text-muted-foreground">
          <p>This help article provides guidance on {result.title.toLowerCase()}.</p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center">
        <Button variant="link" className="px-0" asChild>
          <Link href={result.href} className="flex items-center">
            View Help Article
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
