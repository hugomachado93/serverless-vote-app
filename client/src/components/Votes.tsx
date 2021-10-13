import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { createVote, getVotes, patchVote, patchVoteDone, deleteVote } from '../api/votes-api'
import Auth from '../auth/Auth'
import { Vote } from '../types/Vote'
import SemanticDatepicker from 'react-semantic-ui-datepickers';

interface VotesProps {
  auth: Auth
  history: History
}

interface VotesState {
  votes: Vote[]
  newVoteName: string
  voteEndDate: string
  voteQuestion: string
  loadingVotes: boolean
}

export class Votes extends React.PureComponent<VotesProps, VotesState> {
  state: VotesState = {
    votes: [],
    newVoteName: '',
    voteEndDate: '',
    voteQuestion: '',
    loadingVotes: true
  }

  handleVoteName = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newVoteName: event.target.value })
  }

  handleEndDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ voteEndDate: event.target.value })
  }

  handleQuestion = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ voteQuestion: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()
    try {
      const dueDate = this.calculateDueDate()
      const newVote = await createVote(this.props.auth.getIdToken(), {
        voteName: this.state.newVoteName,
        startDate: dueDate,
        endDate: this.state.voteEndDate,
        question: this.state.voteQuestion,
      })
      this.setState({
        votes: [...this.state.votes, newVote],
        newVoteName: ''
      })
    } catch {
      alert('Vote creation failed')
    }
  }

  onVoteYesOrNo = async (pos: number, voteType: string) => {
    const vote = this.state.votes[pos]
    await patchVote(this.props.auth.getIdToken(), vote.voteId, {
      voteType
    })
  }

  onEditButtonClick = (voteId: string) => {
    this.props.history.push(`/votes/${voteId}/edit`)
  }

  onVoteDelete = async (voteId: string) => {
    try {
      await deleteVote(this.props.auth.getIdToken(), voteId)
      this.setState({
        votes: this.state.votes.filter(vote => vote.voteId !== voteId)
      })
    } catch {
      alert('Vote deletion failed')
    }
  }

  onVoteCheck = async (pos: number) => {
    try {
      const vote = this.state.votes[pos]
      await patchVoteDone(this.props.auth.getIdToken(), vote.voteId, {
        done: !vote.done
      })
      this.setState({
        votes: update(this.state.votes, {
          [pos]: { done: { $set: !vote.done } }
        })
      })
    } catch {
      alert('Vote deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const votes = await getVotes(this.props.auth.getIdToken())
      this.setState({
        votes,
        loadingVotes: false
      })
    } catch (e) {
      alert(`Failed to fetch votes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Votes</Header>

        {this.renderCreateVoteInput()}

        {this.renderVotes()}

      </div>
    )
  }

  renderCreateVoteInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form onSubmit={this.handleSubmit}>
            <Form.Input
              label='Vote name'
              placeholder='Name'
              name='name'
              onChange={this.handleVoteName} />
            <Form.Input
              label='Question'
              placeholder='Question for vote'
              name='name'
              onChange={this.handleQuestion} />
            <Form.Input
              label='Vote end date (2021-11-11)'
              placeholder='vote date here (2021-11-11)'
              name='name'
              onChange={this.handleEndDateChange} />
            <Form.Button>Create vote</Form.Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderVotes() {
    if (this.state.loadingVotes) {
      return this.renderLoading()
    }

    return this.renderVotesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Votes
        </Loader>
      </Grid.Row>
    )
  }

  renderVotesList() {
    return (
      <Grid padded>
        {this.state.votes.map((vote, pos) => {
          return (
            <Grid.Row key={vote.voteId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onVoteCheck(pos)}
                  checked={vote.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {vote.voteName}
              </Grid.Column>
              <Grid.Column width={4} verticalAlign="middle">
                {vote.question}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {this.calculateDateDiff(new Date(vote.endDate)) + ' days left to end vote'}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {`Vote no count: ${vote.voteNoCount} | Vote yes count: ${vote.voteYesCount}`}
              </Grid.Column>
              <Grid.Row width={5} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onVoteYesOrNo(pos, 'yes')}
                >Vote yes
                  <Icon name="angle up" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVoteYesOrNo(pos, 'no')}
                >Vote no
                  <Icon name="angle down" />
                </Button>
              </Grid.Row>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(vote.voteId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVoteDelete(vote.voteId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {vote.attachmentUrl && (
                <Image src={vote.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }


  calculateDateDiff(endDate: Date): string {
    const date = new Date()
    const diff = endDate.getTime() - date.getTime()
    const diffInDays = Math.round(diff / (1000 * 3600 * 24));
    return diffInDays.toString();
  }

}
