import { Component, type ReactNode } from 'react'

/**
 * 子でエラーが起きても、アプリ全体を真っ白にせず、その部分だけ代わりの表示にする。
 * label は「この図」「このタブ」のように、何が表示できなかったかを示す。
 */
export class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error) {
    console.error('[Mathscope]', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="error-box" role="alert">
        <p>{this.props.label ?? 'この部分'}を表示できませんでした。</p>
        <button className="btn" onClick={() => this.setState({ error: null })}>
          もう一度表示する
        </button>
      </div>
    )
  }
}
