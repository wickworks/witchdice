import React from 'react';
import NouveauDivider from '../shared/NouveauDivider.jsx';

import './MainTOS.scss';

const MainTOS = ({
  enabledPages, setEnabledPages
}) => {

  return (
    <>
      <div className='MainTOS'>
        <div className='terms-panel'>
          <h1>Terms of Service</h1>

          <p>By using the Discord integration ("Service")  created for witchdice.com ( "We", "Us", "Our" ), you are agreeing to be bound by the following terms and conditions ("Terms of Service").</p>

          <p>If the owner makes material changes to these Terms, we will post a notice in the header of the site before the changes are effective. Any new features that augment or enhance the current Service shall be subject to the Terms of Service. Continued use of the Service after any such changes shall constitute your consent to such changes.</p>

          <p>You must be 13 years or older to use this Service.</p>

          <p>Furthermore, you understand that you may access the service by connecting from within the Discord app. Any use of the integration is bound by these Terms of Service, Discord's Terms of service, plus the following specific terms:</p>

          <p>You expressly understand and agree that we shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses, resulting from your use of the integration.</p>
          <ul>
              <li>Abuse or excessively frequent requests to the Witchdice API by modifying the integration code for your own use may result in the temporary or permanent suspension of your access to the integration.</li>
              <li>We reserve the right at any time to modify or discontinue, temporarily or permanently, your access to the integration (or any part thereof) with or without notice.</li>
              <li>You may not duplicate, copy, or reuse any portion of the integration code or concepts without express written permission from us. Your use of the Service is at your sole risk. The service is provided on an “as is” and “as available” basis.</li>
              <li>We do not warrant that (i) the service will meet your specific requirements, (ii) the service will be uninterrupted, timely, secure, or error-free, (iii) the results that may be obtained from the use of the service will be accurate or reliable, (iv) the quality of any products, services, information, or other material purchased or obtained by you through the service will meet your expectations, and (v) any errors in the Service will be corrected.</li>
              <li>You expressly understand and agree that we shall not be liable for any direct, indirect, incidental, special, consequential or exemplary damages, including but not limited to, damages for loss of profits, goodwill, use, data or other intangible losses. The failure to exercise or enforce any right or provision of the Terms of Service shall not constitute a waiver of such right or provision.</li>
              <li>You agree that you will not intentionally access the active room of another person without their permission, nor will you interfere with their use of the Service.</li>
          </ul>

          <p>Violation of any of the above stated terms can, and most likely will, result in the banning of your IP address. As the user, you agree to use the Service at your own risk and free witchdice bot, it's developer and/or team members, free of any fault.</p>

          <p>At any time you wish to revoke this app's access, you may do so by following the steps listed on discordapp.com.</p>

          <p>Questions about the above Terms of Service or the privacy policy below should be sent to contact@wick.works.</p>
        </div>

        <div className='terms-panel'>
          <h1>Privacy Policy</h1>

          <p>The use of this application ("Bot") in a server requires the collection of some specific user data ("Data"). The Data collected consists of the name that you enter for access to a shared room and anonymized traffic data processed by Plausible.com. Use of the Bot is considered an agreement to the terms of this Policy.</p>

          <h2>Access to Data</h2>

          <p>Access to Data is only permitted to Bot's developers, and only in the scope required for the development, testing, and implementation of features for Bot. Data is not sold, provided to, or shared with any third party, except where required by law or a Terms of Service agreement. You can view the data upon request from contact@wick.works.</p>

          <h2>Storage of Data</h2>

          <p>Data is stored in a Firebase database. The database is secured to prevent external access, however no guarantee is provided and the Bot owners assume no liability for the unintentional or malicious breach of Data. In the event of an unauthorised Data access, users will be notified through the Discord client application.</p>

          <h2>User Rights</h2>

          <p>At any time, you have the right to request to view the Data pertaining to your name in a shared room. You may submit a request by emailing contact@wick.works. You have the right to request the removal of relevant Data.</p>

          <h2>Underage Users</h2>

          <p>The use of the Bot is not permitted for minors under the age of 13, or under the age of legal consent for their country. This is in compliance with the Discord Terms of Service. No information will be knowingly stored from an underage user. If it is found out that a user is underage we will take all necessary action to delete the stored data.</p>

          <h2>Questions</h2>

          <p>If you have any questions or are concerned about what data might be being stored from your account contact contact@wick.works. For more information check the Discord Terms Of Service.</p>
        </div>
      </div>

      <NouveauDivider />
    </>
  )
}

export default MainTOS ;
