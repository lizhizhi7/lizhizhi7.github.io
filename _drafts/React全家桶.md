react-router4.2使用js控制路由跳转的3种方式
 react.js  react-router4  redux  29.3k 次阅读  ·  读完需要 11 分钟
一、背景
在很多情况下，我们需要用js来控制页面的路由切换，而不是通过Link标签这种方式，比如有这样一个场景，用户要登陆一个网站才能看到网站里面的内容，登录接口是一个独立的子页面，登陆成功后，才能进入网站浏览相关内容，使用react做SPA时就需要做路由的切换。
二、react-router4.2
在网上随处可见react-router入门使用方式，通过链接绑定组件实现跳转，或者绑定hashHistory后，妄想在子组件中使用this.props.history.push('/某路径')实现路由跳转，诚然，在以前的版本是可行的，据说，反正我没用过。而奇葩的4.2版本并不支持这种方式。我在网上看了许久，试了诸多办法，任然无法通过上述方式实现js控制路由切换，emmm...
三、问题解决办法
使用4.2里面的Redirect标签？组件？，不知道怎么称呼
具体如下：
先定义路由（表）：
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
 <Router >
      <div style={{height:'100%'}}>
      <Switch>
        <Route exact path="/" component={LoginPage}/>
        <Route path="/chat" component={Chat}/>
        <Route path="/home" component={Home}/>
        <Route path="/login" component={Login}/>
      </Switch>
      </div>
    </Router>)
方法一、在子组件里使用
先要引入Redirect

   import { Redirect } from 'react-router';

 class Login extends React.Component {
    
    render() {
    const {isRegisterNewUser,loginSuccess}=this.props;
    const { getFieldDecorator} = this.props.form;
    if(loginSuccess){
      *return (<Redirect to="/chat" />);*
    }else{
     return(
     这里放没登陆之前的各种form表单
     )
    } 
    
  }
}
方法二、来自下面的大佬：静对94
import PropTypes from 'prop-types';

static contextTypes = {

    router: PropTypes.object.isRequired,
}

console.log(this.context.router)
例如：

class Login extends React.Component {
        static contextTypes = {
            router: PropTypes.object.isRequired,
        }
        render() {
        const {isRegisterNewUser,loginSuccess}=this.props;
        const { getFieldDecorator} = this.props.form;
        if(loginSuccess){//登陆状态变为成功
          this.context.router.history.push('/chat)
        }else{
         return(
         这里放没登陆之前的各种form表单
         )
        } 
        
      }
    }
    
方法三、来自Inori_Lover 大佬推荐的官方文档：使用withRouter解决

import {withRouter } from 'react-router';
class Login extends React.Component {
            static contextTypes = {
                router: PropTypes.object.isRequired,
            }
            render() {
            const {isRegisterNewUser,loginSuccess，history}=this.props;
            const { getFieldDecorator} = this.props.form;
            if(loginSuccess){//登陆状态变为成功
              this.props.history.push('/chat)
            }else{
             return(
             这里放没登陆之前的各种form表单
             )
            } 
            
          }
        }
        ...
        
const Login=withRouter(connect(mapStateToProps,mapDispatchToProps)(TLogin))
export default Login;
如果你没有使用redux，那么你使用withRouter的正确姿势应该是

const Login=withRouter(TLogin)
export default Login;
