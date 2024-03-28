import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { getSDK, initSDK, getLatestConfig } from '@/admin-sdk/index.js'
import { BiErrorCircle } from 'react-icons/bi/index.js'
import Link from 'next/link.js'
import { IoLogoFirebase } from 'react-icons/io5/index.js'
import { Bling } from './comps/common-ui.jsx'
import useInterval from './hooks/useInterval.js'
import Copyright from './comps/copyright.jsx'
import { BsDiscord, BsGithub, BsLinkedin } from 'react-icons/bs/index.js'
import { HiOutlineMail } from 'react-icons/hi/index.js'

const createConfig = c => {
  
  return {
    email: c.email,
    endpoint: c.endpoint
  }
}

/**
 * @param {object} p 
 * @param {object} p.value 
 * @param {string} p.desc 
 * @param {string} p.id key in value
 * @param {string} p.label 
 * @param {object[]} p.rest 
 * @param {(id: string, value: string) => void} p.onChange 
 */
const Field = 
  ({ value, desc, id, label, onChange, ...rest }) => {

  return (
<div className='text-pink-600 font-semibold'>
  <p children={label} className='tracking-widest' />
  { desc && 
    <p children={desc} 
       className='tracking-normal font-inter my-3 font-normal text-gray-500' />
  }
  <Bling className='mt-2'>
    <input 
        className={`rounded-md h-10 px-3
                    w-full block text-base text-gray-800
                  placeholder-gray-400 bg-slate-100 rounded-xs
                  focus:outline-kf-300 
                    font-normal transition-none `} 
        value={value[id] ?? ''} 
        onChange={e => onChange(id, e.currentTarget.value)} 
                 {...rest}/>    
  </Bling>      

</div>    
  )
}

/**
 * 
 * @param {object} p 
 * @param {(id: any, value: any) => void} p.onChange 
 * @param {() => void} p.onSubmit 
 * @param {object} p.error 
 * @param {string} p.className 
 * @param { { email: string, password: string }} p.credentials
 */
const LoginForm = (
  {
    onChange, onSubmit, error, className, credentials
  }
) => {
  return (
<div className={className}>
  <Bling  className='shadow-lg shadow-gray-300'
          stroke='p-1' to='to-kf-400'>
    <form className='w-full p-5 bg-white flex flex-col text-sm 
                      tracking-wider font-medium gap-5 rounded-md'
          onSubmit={onSubmit}>
      <Field id='email' label='Email' type='email' 
              desc={`Email of admin user`} value={credentials} 
              onChange={onChange} autoComplete='on' 
              name='email'/>
      <Field id='password' label='Password' type='password' 
              desc={`Password of admin user. Initial password is 'admin'`} 
              value={credentials} 
              onChange={onChange}  autoComplete='on' 
              name='password' />
      <Bling stroke='p-1 w-full' from='from-kf-500' to='to-pink-400'>
        <input type='submit' value='LOGIN' 
               title='Login' alt='Login'
               className='h-10 rounded-md bg-white tracking-widest 
                            w-full text-gray-500 text-base 
                            cursor-pointer'/>
      </Bling>
      {
        error &&
        (<div className='flex flex-row flex-nowrap items-center text-base 
                        text-red-700 bg-red-100 border border-red-400 
                        rounded-md p-3 mt-0 '>
          <BiErrorCircle 
              className='flex-inline text-xl flex-shrink-0 opacity-70' /> 
          <div children={error} className='ml-3' />
        </div>)
      }

      <Field id='endpoint' label='Backend Endpoint' type='text' 
              desc={`The Storecraft Backend Endpoint`} 
              value={credentials} 
              onChange={onChange} autoComplete='on' 
              name='endpoint' />
    </form>
  </Bling>    
</div>    
  )
}

const Paragraph = ({}) => {

  return (
<div className='flex flex-col justify-start mx-auto 
                      items-center text-6xl md:text-5xl'>
  <p children='welcome' 
      className='w-fit pl-0.5 text-6xl md:text-9xl 
                 tracking-widest 
                  text-transparent bg-clip-text bg-gradient-to-r 
                  from-kf-600 to-kf-200 font-thin' />

  <p children='to' 
     className='w-fit pl-0.5 mt-0 font-thin text-4xl 
                text-transparent bg-clip-text 
                bg-gradient-to-r from-pink-500 to-pink-200' />

  <div className='w-fit h-fit mt-1 --translate-y-6 --scale-125'>
    <span children='#' 
          className='hidden font-bold sm:inline 
                   text-gray-800 text-6xl md:text-6xl' /> 
    <div children='shelf//CMS' 
      className=' break-words inline pl-0.5 font-mono font-normal 
                text-5xl sm:text-7xl md:text-7xl text-transparent 
                tracking-wide bg-clip-text bg-gradient-to-r 
                from-kf-600 to-pink-400' >
    </div>
  </div>

  <img src='/main/main_half.png' draggable='false'
       className='mt-7 max-w-[16rem] sm:max-w-none'/>

  <p children='Commerce' 
      className='w-fit pl-0.5 mt-3 font-thin text-transparent 
                bg-clip-text bg-gradient-to-r 
                from-pink-400 to-pink-400' />
</div>
  )
}

const Capsule = ({}) => {

  return (
<Bling rounded='rounded-full' stroke='p-0.5' from='from-pink-400' to='to-pink-500'>
  <div className='rounded-full my-auto bg-kf-800 w-fit text-sm
                  py-1 px-2 --border text-white font-semibold'>
   <span children='Read The docs' />
  </div> 
</Bling>       
  )
}


const Marquee = ({ ...rest }) => {

  return (
<div {...rest} >
  <div className='w-full h-full px-3
            flex flex-row items-center
            bg-gradient-to-r from-pink-500 to-kf-500
            justify-between text-sm sm:text-base whitespace-nowrap'>
    <div className='flex flex-row items-center text-white flex-wrap'>
      <div className='hidden md:flex flex-row items-center text-white
                      '>
        <span children='🥳 SHELF' className='tracking-widest font-bold'/>
        &nbsp;
        <span children={`is HERE`} className=''/>
        &nbsp;
        <span children='>' className='font-extrabold text-white'/>
        &nbsp;
        <span children='Turn your' className=''/>
        &nbsp;
      </div>
      <IoLogoFirebase className='text-amber-400 scale-125' />
      &nbsp;
      <Link href='https://firebase.google.com/' target='_blank' 
            className='border-b border-dashed border-yellow-300 px-0 border-'>
        <span children='FIREBASE' className='tracking-widest text-yellow-300 font-bold'/>
      </Link>
      &nbsp;
      <span children='project into a' className=''/>
      &nbsp;
      <span children='HEADLESS CMS' className='tracking-widest font-bold'/>
    </div>
    <Link href='docs' className='animate-pulse'
          title='Read The Docs'
          alt='Read The Docs'>
      <Capsule />
    </Link>
  </div>
</div>    
  )
}


const Connect = ({...rest}) => {

  return (
<div {...rest}>
  <div className='w-full h-10 flex flex-row justify-end items-center
                  text-gray-500 gap-3 py-3 px-4'>
    <a href='mailto:support@shelf-cms.io' 
       title='Send us Email to support@shelf-cms.io'
       alt='Send us Email to support@shelf-cms.io'
       target='_blank' rel='noopener noreferrer'>
      <HiOutlineMail className='text-2xl --animate-pulse'/>
    </a>
    <a href='https://discord.gg/zd2dvpFr' 
       title='Join our Discord'
       alt='Join our Discord'
       target='_blank' rel='noopener noreferrer'>
      <BsDiscord className='text-2xl --animate-pulse'/>
    </a>
    <a href='https://github.com/shelf-cms' 
       title='Fork us on Github'
       alt='Fork us on Github'
       target='_blank' rel='noopener noreferrer'>
      <BsGithub className='text-xl'/>
    </a>
    <a href='https://linkedin.com/company/shelf-cms/'
       title='Catch us at Linkedin'
       alt='Catch us at Linkedin'
       target='_blank' rel='noopener noreferrer'>
      <BsLinkedin className='text-xl'/>
    </a>
    
  </div>
</div>    
  )
}

const Login = ({ trigger }) => {
  const [credentials, setCredentials] = useState(getLatestConfig() ?? {})
  const [error, setError] = useState(undefined)
  console.log('credentials ', credentials)

  useEffect(
    () => {
      const searchParams = new URLSearchParams(location.search)
      const params = Object.fromEntries(searchParams.entries())
      setCredentials(c => ({...c, ...params}))
    }, [location.search]
  )
  
  const onChange = useCallback(
    (id, val) => {
      setCredentials( { ...credentials, [id] : val } )
    },
    [credentials],
  )

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault()
      console.log('submit');

      try {
        console.log('credentials ', credentials);
        initSDK(createConfig(credentials))
        trigger()
      } catch (e) {
        const msg = e ? String(e) : 'check your project ID or API Key'
        setError(`Error initializing Shelf, code : ${msg}`)
      }
 
      try {
        await getSDK().auth.signin_with_email_pass(
          credentials.email, 
          credentials.password
        );

      } catch (e) {
        const code = e ? String(e) : 'Auth error'
        setError(`Error signing, code : ${code}`)
      }
    },
    [credentials, trigger],
  )

  return (
<div className='relative w-full h-full overflow-auto bg-slate-100'>

  <Marquee className='w-full h-12' />
  <Connect className='absolute w-full left-0 top-12 h-fit 
          z-30  --bg-green-300/30 ' />
  <div className='w-full h-fit md:h-screen 
                  flex flex-col 
                  md:overflow-auto
                  items-center justify-start 
                  md:justify-center md:items-start 
                  md:flex md:flex-row 
                  --bg-green-500'>

    <div className='flex-shrink-0 order-1 md:order-1
                    scale-[0.8] -translate-y-6 md:translate-y-0 origin-center
                    w-fit max-w-[22rem] --sm:w-[22rem] h-fit 
                    rounded-md md:scale-[0.80] 
                    m-3 --pb-52 md:m-10 md:origin-top-left'
        sstyle={{transformOrigin: 'top center'}}>
      <LoginForm className='w-fit ' 
                 onSubmit={onSubmit} 
                 credentials={credentials}
                 onChange={onChange} 
                 error={error} />
    </div>

    <Carousel className=' --bg-red-100 order-2 md:flex-1 
                    w-full md:w-fit
                    h-[624px] md:h-full
                    -translate-y-24 md:translate-y-0
                    md:-ml-20
                    flex flex-row items-start
                    md:py-0
                    --bg-gradient-to-t md:bg-gradient-to-r 
                    from-slate-100 to-teal-50 --bg-green-400'>

      <div className='pt-10 md:pt-0 mx-auto w-fit h-auto '>
        <Paragraph />
      </div>  
      <ImageItem src='login/col-1.webp' 
                 text='Easily Create collection of products' />
      <ImageItem src='login/dash-1.webp' 
                 text='Beautiful dashboard will reveal your income and trends' />
      <ImageItem src='login/orders-1.webp' 
                 text='Watch your orders and handle payments' />
      <ImageItem src='login/mob-1.webp' 
                 text='Slick mobile experience' 
                 className='max-w-[350px] md:w-[350px]'/>
      <ImageItem src='login/mob-2.webp' 
                 text='Slick mobile experience' 
                 className='max-w-[350px] md:w-[350px]'/>
      <ImageItem src='login/mob-3.webp' 
                 text='Slick mobile experience' 
                 className='max-w-[350px] md:w-[350px]'/>
      <ImageItem src='login/noti-1.webp' 
                 text='Notifications are always there for you' />
      <ImageItem src='login/dis-1.webp' 
                 text='Create Five types of layered discounts' />
      <ImageItem src='login/dis-2.webp' 
                 text='With slick UI and explanations' />
      <ImageItem src='login/media-1.webp' 
                 text='Edit your media images with Crop, Rotations, 
                 Scaling, Translations and more' />
      <ImageItem src='login/sf-1.webp' 
                 text='Create amazing store fronts' />
      <ImageItem src='login/storage-1.webp' 
                 text='Connect your favorite storage' />
      <ImageItem src='login/light-1.webp' 
                 text='Choose between Dark and Light mode' />
      <ImageItem src='login/tag-1.webp' 
                 text='Create special tags easily and use them everywhere' />
      <ImageItem src='login/va-1.webp' 
                 text='Create variants of products with few clicks' />
      <ImageItem src='login/gal-1.webp' 
                 text='A rich images gallery' />
      <ImageItem src='login/docs-1.webp' 
                 text="Up to date docs to keep you learning " />
    </Carousel>
    
  </div>
  <Copyright className='relative md:fixed md:left-10 md:bottom-0'  />
</div>
  )
}

/**
 * @param {object} p
 * @param {string} p.src
 * @param {string} p.text
 * @param {string} [p.className]
 */
const ImageItem = ({src, text, className='max-w-[768px] md:w-[768px]'}) => {

  return (
<div className={`p-10 flex flex-col-reverse gap-5 mx-auto w-full 
                 h-fit  ${className} `}>
  
  <img src={src} 
        className='object-center object-contain rounded-xl 
                  shadow-xl border w-full h-auto' /> 
   <p className='text-4xl font-extrabold text-pink-600' 
      children={text} />     
</div>  
  )
}

/**
 * Lazy ass `carousel`
 * @param {object} p
 * @param {any} [p.children]
 * @param {number} [p.millis]
 * @param {string} [p.className]
 */
const Carousel = ({ children, millis=3000, ...rest}) => {
  const [c, setC] = useState(-1)
  const children_ = useMemo(
    () => children ? React.Children.toArray(children) : [],
    [children]
  ) 
  const count = children_.length

  const cb = useCallback(
    () => setC(cc => (cc+1)%count),
    [count]
  )

  const key_prev = (c-1 + count)%count
  const key_next = (c + count)%count

  useInterval(
    cb, millis
  )

  return (
<div {...rest} >
  <div className='relative w-full h-full'>
    <div className='absolute left-0 top-0 w-full h-full animate-fadeout' 
      key={key_prev}
      style={{'animation-fill-mode': 'forwards'}}>
      {children_[key_prev]}
    </div>
    <div className='absolute left-0 top-0 w-full h-full animate-fadein' 
          key={key_next}
          style={{'animation-fill-mode': 'forwards'}}>
      {children_[key_next]}
    </div>
  </div>
</div>    
  )
}

export default Login