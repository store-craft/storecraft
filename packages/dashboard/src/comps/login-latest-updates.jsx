import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa/index.js";

/**
 * 
 * @typedef {object} GithubCommit
 * @prop {string} sha
 * @prop {string} node_id
 * @prop {object} commit
 * @prop {object} commit.author
 * @prop {string} commit.author.name
 * @prop {string} commit.author.email
 * @prop {string} commit.author.date
 * @prop {string} commit.message
 * @prop {string} commit.url
 * @prop {string} url
 * @prop {string} html_url
 * @prop {object} author
 * @prop {string} author.login
 * @prop {string} author.id
 * @prop {string} author.avatar_url
 * @prop {string} author.url
 * @prop {string} author.html_url
 * 
 * @typedef {GithubCommit[]} GithubCommits
 */


/**
 * @typedef {object} CommitViewParams
 * @prop {GithubCommit} commit
 * 
 * @param {CommitViewParams} params 
 */
const CommitView = (
  {
    commit
  }
) => {

  return (
<div className='w-full flex flex-row gap-3 items-center'>
  <a href={commit?.html_url} target='blank'>
    <div className='text-[10px] font-bold w-11 text-center border rounded-md 
                  bg-pink-500/15 border-pink-500/20 px-1 --shadow-md 
                  text-pink-500/90 font-mono tracking-wider
                  shadow-pink-500 shadow-[0px_0px_2px]' 
        children={commit?.sha?.slice(-5)}
        />
  </a>
  <div className='w-full line-clamp-1 text-sm' children={commit?.commit?.message}/>
</div>    
  )
}

/**
 * 
 * @param {React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>} params 
 */
const LoginLatestUpdates = (
  {
    ...rest
  }
) => {

  /**
   * @type {ReturnType<typeof useState<GithubCommits>>}
   */
  const [commits, setCommits] = useState([]);

  useEffect(
    () => {
      async function get_commits() {
        try {
          const response = await fetch(
            'https://api.github.com/repos/micro-gl/micro-gl/commits'
          );
  
          const json = await response.json();
  
          setCommits(json);
        } catch (e) {

        }
      }

      get_commits()

    }, []
  );

  if(!Boolean(commits?.length))
      return null;

  return (
 <div {...rest}>
  <div className='flex-1 h-fit md:h-full'>
    <div className='w-fit h-fit md:h-full flex flex-col gap-3 mx-auto'>
      <div className='flex flex-row items-center gap-2'>
        <FaGithub />
        <p children='Latest Commits' className='font-bold font-inter' />
      </div>
      <div className='flex flex-1 flex-col gap-3 w-full md:overflow-auto p-0.5'>
        {
          commits.map(
            c => (
              <CommitView key={c.sha} commit={c} />
            )
          )
        }
      </div>
    </div>
  </div>
</div>

  )
}

export default LoginLatestUpdates;
