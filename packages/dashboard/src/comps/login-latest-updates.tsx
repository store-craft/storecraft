import React, { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa/index.js";

export type GithubCommit = {
    sha: string;
    node_id: string;
    commit: {
        author: {
            name: string;
            email: string;
            date: string;
        };
        message: string;
        url: string;
    };
    url: string;
    html_url: string;
    author: {
        login: string;
        id: string;
        avatar_url: string;
        url: string;
        html_url: string;
    };
};
export type GithubCommits = GithubCommit[];
export type CommitViewParams = {
    commit: GithubCommit;
};

const CommitView = (
  {
    commit
  }: CommitViewParams
) => {

  return (
<div className='w-full flex flex-row gap-3 items-center'>
  <a href={commit?.html_url} target='blank'>
    <div className='text-[10px] font-bold w-11 text-center border rounded-md 
                    bg-gradient-to-r
                  from-pink-500/30 border-pink-500/20 px-1 --shadow-md 
                  text-pink-500/90 font-mono tracking-wider
                  shadow-pink-500 shadow-[0px_0px_2px]' 
        children={commit?.sha?.slice(-5)}
        />
  </a>
  <div className='w-full line-clamp-1 text-sm' children={commit?.commit?.message}/>
</div>    
  )
}

const LoginLatestUpdates = (
  {
    ...rest
  }: React.ComponentProps<'div'>
) => {

  const [commits, setCommits] = useState<GithubCommits>([]);

  useEffect(
    () => {
      async function get_commits() {
        try {
          const response = await fetch(
            'https://api.github.com/repos/store-craft/storecraft/commits'
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
