import React, { Component, Suspense } from 'react'
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'
import './scss/style.scss'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'))
const VerifyCode = React.lazy(() => import('./views/pages/verifycode/VerifyCode'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      isFetching: true,
      response: 0,
    }
  }

  componentDidMount() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'text/html' },
      body: '',
    }

    fetch(process.env.REACT_APP_BASE_URL + '/checkSession', requestOptions)
      .then((res) => res.text())
      .then((res) => {
        this.setState({ isFetching: false, response: parseInt(res) })

        //console.log(res)
      })
      .catch((err) => {
        this.setState({ isFetching: false, response: 0 })
      })
  }

  render() {
    return (
      <HashRouter>
        <Suspense fallback={loading}>
          <Routes>
            {/* <Route exact path="/" element={<Navigate to="dashboard" replace />} /> */}
            <Route path="/login" name="Login Page" element={<Login />} />
            <Route path="/register" name="Register Page" element={<Register />} />
            <Route path="/verifycode" name="Register Page" element={<VerifyCode />} />
            <Route path="/404" name="Page 404" element={<Page404 />} />
            <Route path="/500" name="Page 500" element={<Page500 />} />
            {this.state.isFetching == false && this.state.response == 2 && <Route path="*" name="Home" element={<DefaultLayout />} />}
            {this.state.isFetching == false && this.state.response == 0 && <Route path="*" name="Home" element={<Login />} />}
            {this.state.isFetching == false && this.state.response == 1 && <Route path="*" name="Home" element={<VerifyCode />} />}
          </Routes>
        </Suspense>
      </HashRouter>
    )
  }
}

export default App
