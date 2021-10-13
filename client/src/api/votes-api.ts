import { apiEndpoint } from '../config'
import Axios from 'axios'
import { CreateVoteRequest } from '../types/CreateVoteRequest';
import { Vote } from '../types/Vote';
import { UpdateVoteRequest } from '../types/UpdateVoteRequest';
import { UpdateVoteDoneRequest } from '../types/UpdateVoteDoneRequest';

export async function getVotes(idToken: string): Promise<Vote[]> {
  console.log('Fetching votes')

  const response = await Axios.get(`${apiEndpoint}/votes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Votes:', response.data)
  return response.data.items
}

export async function createVote(
  idToken: string,
  newVote: CreateVoteRequest
): Promise<Vote> {
  const response = await Axios.post(`${apiEndpoint}/votes`,  JSON.stringify(newVote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchVote(
  idToken: string,
  voteId: string,
  updatedVote: UpdateVoteRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/votes/${voteId}/types`, JSON.stringify(updatedVote), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function patchVoteDone(
  idToken: string,
  voteId: string,
  updatedVoteDone: UpdateVoteDoneRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/votes/${voteId}`, JSON.stringify(updatedVoteDone), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteVote(
  idToken: string,
  voteId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/votes/${voteId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  voteId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/votes/${voteId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
