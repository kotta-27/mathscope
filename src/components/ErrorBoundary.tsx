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
    const { error } = this.state
    if (!error) return this.props.children
    // ファイルの読み込みに失敗したとき（新しい版のデプロイで古いファイルが消えた、通信が切れたなど）は、
    // React.lazy が失敗を覚えているので、描き直しでは直らない。ページごと読み込み直す
    const chunk = /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i.test(error.message)
    return (
      <div className="error-box" role="alert">
        <p>
          {this.props.label ?? 'この部分'}を表示できませんでした。
          {chunk && '新しい版に更新されたか、通信が切れた可能性があります。'}
        </p>
        {chunk ? (
          <button className="btn primary" onClick={() => location.reload()}>
            ページを再読み込み
          </button>
        ) : (
          <button className="btn" onClick={() => this.setState({ error: null })}>
            もう一度表示する
          </button>
        )}
      </div>
    )
  }
}
