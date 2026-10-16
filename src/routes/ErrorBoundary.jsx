import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled React Render Error:', error, errorInfo)
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4 shadow-sm border border-red-100">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Đã xảy ra lỗi khi tải giao diện</h2>
          <p className="mt-2 max-w-md text-sm font-medium text-slate-500">
            {this.state.error?.message || 'Không thể hiển thị trang tài chính. Vui lòng thử làm mới trang.'}
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <RefreshCw size={16} />
            Tải lại trang
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
