import React from 'react';

import {
  convertLocalDataToJson,
} from '../../localstorage.js';

import './ManageLocalContent.scss';

const ManageLocalContent = () => {

  const onDownloadBackup = () => {
    var date = new Date();
    const currentDate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate()
    const fileName = `witchdice-backup-${currentDate}.json`

    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(convertLocalDataToJson());
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    console.log('Downloading witchdice backup: ', fileName);
  }

  const onUploadBackup = e => {
    const fileName = e.target.files[0].name

    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = e => {

      console.log('Uploading witchdice backup: ', fileName);

      // compcon backups — have a lot of stuff we don't need
      if (fileName.endsWith('.json')) {
        const witchdiceBackup = JSON.parse(e.target.result)

        // Object.keys(witchdiceBackup).forEach(backupKey => {
        //   localStorage.setItem(backupKey, witchdiceBackup[backupKey]);
        //   console.log('     Restoring entry: ', backupKey);
        // });

        const skipList = ['version'] // don't override this

        // see how many things will be overwritten
        var overwriteCount = 0
        Object.keys(witchdiceBackup).forEach(backupKey => {
          if (!!localStorage.getItem(backupKey) && !skipList.includes(backupKey)) {
            overwriteCount += 1
            console.log('  Uploading backup will override key: ', backupKey);
          }
        });

        // merge in the backup
        if (
          overwriteCount == 0 ||
          window.confirm(`Uploading this backup will override ${overwriteCount} data entries. Continue?`)
        ) {
          Object.keys(witchdiceBackup).forEach(backupKey => {
            if (!skipList.includes(backupKey)) {
              localStorage.setItem(backupKey, witchdiceBackup[backupKey]);
            }
          });
          window.location.replace(window.location.pathname); // reload
        }
      }
    };
  }

  const onDeleteAllLocalData = () => {
    if (window.confirm(
      'This will delete all data that Witch Dice has saved locally to this browser, resetting it back to default settings. Are you sure you wish to continue?'
    )) {
      localStorage.clear();
      // window.location.reload();
      window.location.replace(window.location.pathname); // reload
    }
  }


  return (
    <div className='ManageLocalContent'>
      <h3>Manage data</h3>

      <button onClick={onDownloadBackup}>
        Download backup
      </button>

      <label>
        Restore backup
        <input type="file" accept={'application/JSON'} onChange={onUploadBackup} />
      </label>

      <button onClick={onDeleteAllLocalData}>
        Clear local data
      </button>
    </div>
  )
}

export default ManageLocalContent ;
