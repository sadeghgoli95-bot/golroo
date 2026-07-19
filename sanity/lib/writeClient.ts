import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/**
 * Separate from client.ts on purpose: this is the only client allowed to
 * mutate the dataset, so it's the only one that reads SANITY_API_TOKEN.
 * The token is intentionally optional here — SanityArticleRepository.
 * createDraft() checks for it explicitly and throws a clear
 * RepositoryError before ever calling this client, rather than letting
 * an unauthenticated write fail with an opaque Sanity error.
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})
