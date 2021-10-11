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

import { createVote, deleteTodo, getVotes, patchVote, patchVoteDone } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Vote } from '../types/Vote'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  votes: Vote[]
  newVoteName: string
  voteEndDate: string
  voteQuestion: string
  loadingVotes: boolean
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
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
      alert('Todo creation failed')
    }
  }

  onVoteYesOrNo = async (pos: number, voteType: string) => {
    const todo = this.state.votes[pos]
    await patchVote(this.props.auth.getIdToken(), todo.voteId, {
      voteType
    })
  }

  onEditButtonClick = (voteId: string) => {
    this.props.history.push(`/todos/${voteId}/edit`)
  }

  onVoteDelete = async (voteId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), voteId)
      this.setState({
        votes: this.state.votes.filter(todo => todo.voteId !== voteId)
      })
    } catch {
      alert('Vote deletion failed')
    }
  }

  onVoteCheck = async (pos: number) => {
    try {
      const todo = this.state.votes[pos]
      await patchVoteDone(this.props.auth.getIdToken(), todo.voteId, {
        done: !todo.done
      })
      this.setState({
        votes: update(this.state.votes, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo deletion failed')
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
      alert(`Failed to fetch todos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>

        <Form onSubmit={this.handleSubmit}>
          <Form.Input               
            placeholder='Name'
            name='name'
            onChange={this.handleVoteName} />
          <Form.Input               
            placeholder='Question for vote'
            name='name'
            onChange={this.handleQuestion} />
          <Form.Input               
            placeholder='Vote duration (minutes)'
            name='name'
            onChange={this.handleEndDateChange} />
          <Form.Button>Submit</Form.Button>
        </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingVotes) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
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
                {this.calculateDateDiff(new Date(vote.endDate)) + ' days left' }
              </Grid.Column>
              <Grid.Row width={5} floated="right">
                <Button
                  icon
                  color="green"
                  onClick={() => this.onVoteYesOrNo(pos, 'yes')}
                >
                  <Icon name="angle up" />
                </Button>
                <Button
                  icon
                  color="red"
                  onClick={() => this.onVoteYesOrNo(pos, 'no')}
                >
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
