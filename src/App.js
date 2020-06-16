//#region > Imports
//> React
// Contains all the functionality necessary to define React components
import React from "react";
// DOM bindings for React Router
import { withRouter } from "react-router-dom";
//> Additional
// SHA Hashing algorithm
import sha256 from "js-sha256";
//> Intel
import { Intel } from "snek-intel";
//> MDB
// "Material Design for Bootstrap" is a great UI design framework
import { MDBProgress } from "mdbreact";

//> Components
/**
 * Footer: Global Footer
 * Navbar: Global navigation bar
 */
import { Footer, Navbar } from "./components/molecules";
// Starts the page on top when reloaded or redirected
import { ScrollToTop } from "./components/atoms";
//> Routes
import Routes from "./Routes";
//> Actions
import {
  ferry,
  login,
  logout,
  fetchGitLabServers,
  appendSourceObjects,
  getAllPageUrls,
  getData,
  saveSettings,
  register,
  readCache,
  updateCache,
  writeCache,
  getAllTalks,
  getTalk,
  uploadTalk,
  deleteTalk,
} from "./actions";
//#endregion

//#region > Components
/**
 * @class Root component which loads all other components
 */
class App extends React.Component {
  state = {
    loggedUser: undefined,
    fetchedUser: undefined,
    loading: true,
    caching: false,
  };

  globalFunctions = {
    /** Authentication Actions*/
    login: async (username, password) =>
      this.handleLoginSession({ username, password: sha256(password) }),
    logout: async () => this.handleLogout(),
    /** General Actions */
    fetchGitLabServers: async () => ferry(fetchGitLabServers()),
    appendSourceObjects: async (sourceList) =>
      ferry(appendSourceObjects(sourceList)),
    users: async () => ferry(getAllPageUrls()),
    saveSettings: async (nextSettings) => this.handleSaveSettings(nextSettings),
    /** User Actions */
    updateCache: async (fetchedUser) => this.handleCacheRenewal(fetchedUser),
    writeCache: async (platformData) => ferry(writeCache(platformData)),
    registerUser: async (registrationData) =>
      this.handleRegistration(registrationData),
    fetchCacheData: async (username) => this.handleProfileFetching(username),
    /** Talk Actions */
    deleteTalk: async (talk) => this.handleTalkDeletion(talk),
    uploadTalk: async (file, talkInfo) => this.handleTalkUpload(file, talkInfo),
    getTalk: (uid, username) => ferry(getTalk(uid, username)),
    /** Controlling Actions */
    refetchRequired: (username) => this.refetchRequired(username),
    usernameMatchesFetchedUsername: (username) =>
      this.usernameMatchesFetchedUsername(username),
  };

  //#region > Refetch Checking
  /**
   * Check for refetch for a specific username.
   *
   * @param {string} username The username associated with a profile page
   * @returns {boolean} True if a refetch is required otherwise False
   */
  refetchRequired = (username) => {
    const loading = this.state.loading;
    const fetchedUser = this.state.fetchedUser;

    if (!loading) {
      if (!fetchedUser && fetchedUser !== false) {
        return true;
      } else if (
        fetchedUser &&
        !this.usernameMatchesFetchedUsername(username)
      ) {
        return true;
      }
      return false;
    }
  };

  /**
   * Handle login session.
   *
   * @param user A user to login with
   * @description Handles states for login
   */
  handleLoginSession = async (user) => {
    return ferry(login(user)).then((loggedUser) => {
      if (loggedUser) {
        this.setState(
          {
            loggedUser,
            loading: false,
          },
          () => console.log(this.state)
        );
        console.log(this.state);
      } else {
        if (this.state.loggedUser !== null) {
          this.setState({
            loggedUser: null,
            loading: false,
          });
        }
      }
    });
  };

  /**
   * Handle logout.
   *
   * @description Handles states for logout
   */
  handleLogout = () => {
    this.setState(
      {
        loggedUser: undefined,
        fetchedUser: undefined,
        loading: false,
        caching: false,
      },
      () => ferry(logout()).then(() => this.handleLoginSession())
    );
  };

  /**
   * Handle registration
   *
   * @param registrationData Data to register a user
   * @description Handles states for registration
   */
  handleRegistration = (registrationData) => {
    ferry(register(registrationData)).then((res) => {
      this.globalFunctions.login(res.username, res.password).then(() => {
        this.globalFunctions.writeCache(registrationData.platform_data);
        this.setState({ caching: true, loading: false });
      });
    });
  };

  /**
   * Handle cache renewal.
   *
   * @param fetchedUser A fetched user object
   * @description Handles states for cache renewal
   */
  handleCacheRenewal = async (fetchedUser) => {
    console.log("Cache update test", fetchedUser);
    if (
      !this.state.caching &&
      this.state.loggedUser?.username ===
        fetchedUser?.platformData.profile?.username
    ) {
      // Renew cache
      const fetchedUser = await ferry(updateCache(fetchedUser));

      this.setState({
        fetchedUser,
        caching: true,
      });
    }
  };

  /**
   * Handle profile fetching.
   *
   * @param username A username to read the cache from
   * @description Handles states for profile fetching
   */
  handleProfileFetching = async (username) => {
    const fetchedUser = await ferry(readCache(username));

    // Update visible data
    this.setState({
      fetchedUser: fetchedUser ? fetchedUser : false,
      loading: false,
    });
  };

  /**
   * Get all talks
   *
   * @description Retrieves a list of all currently available talks
   */
  getAllTalks = async () => {
    return this.intel.getTalks();
  };

  /**
   * Upload talk
   *
   * @description Uploads a talk to intel
   */
  uploadTalk = async (file) => {
    await this.intel.appendTalk(file);

    let talks = await this.getAllTalks();

    talks[talks.length - 1].repository = {
      avatarUrl: this.state.fetchedUser.platformData.profile.avatarUrl,
      owner: {
        username: this.state.user,
      },
    };

    this.state.fetchedUser.platformData.talks.push(talks[talks.length - 1]);
    this.session.tasks.user.cache(
      JSON.stringify(this.state.fetchedUser.platformData)
    );
  };

  /**
   * Delete talk
   *
   * @description Deletes a talk
   */
  deleteTalk = async (talk) => {
    let talks = this.state.fetchedUser.platformData.talks;

    for (const index in talks) {
      if (talk.uid === talks[index].uid) {
        talks.splice(index, 1);
      }
    }

    this.setState({
      fetchedUser: {
        ...this.state.fetchedUser,
        platformData: {
          ...this.state.fetchedUser.platformData,
          talks,
        },
      },
    });

    this.session.tasks.user.cache(
      JSON.stringify(this.state.fetchedUser.platformData)
    );
  };

  /**
   * Get talk
   *
   * @description Get a talk
   */
  getTalk = async (uid, username) => {
    return this.session.tasks.user
      .profile("/registration/" + username)
      .then(async ({ data }) => {
        if (data.profile) {
          let talks = JSON.parse(data.profile.platformData).talks;

          talks = talks.filter((talk) => {
            return talk.uid === uid;
          });

          return talks[0];
        } else {
          //#ERROR
          console.error("GET TALK", "Can not get talk " + uid);
        }
      })
      .catch((err) => {
        //#ERROR
        console.error("GET TALK", err);
      });
  };

  /**
   * Fetch Cache Data
   *
   * @description Retrieves current cache data and updates it
   */
  fetchCacheData = async (username) => {
    this.session.tasks.user
      .profile("/registration/" + username)
      .then(async ({ data }) => {
        // Check if cache is empty
        if (!data.profile) {
          this.setState(
            {
              fetchedUser: false,
              loading: false,
            },
            //#ERROR
            () => console.error("CACHE NOT LOADED")
          );
        } else {
          // Split profile to chunks
          const profile = data.profile;
          const sources = profile.sources ? JSON.parse(profile.sources) : null;

          let platformData = profile.platformData
            ? JSON.parse(profile.platformData)
            : {};

          let user = platformData.user ? platformData.user : {};

          // Check if data is valid
          if (!sources) {
            //#ERROR
            console.error("SOURCES ARE EMPTY", sources);
          } else {
            // Set settings for first time fetching
            if (Object.keys(user).length === 0) {
              user.firstName = profile.firstName;
              user.lastName = profile.lastName;
              user.email = profile.email;
            }

            if (!user.settings) {
              user.settings = {
                show3DDiagram: true,
                show2DDiagram: true,
                showCompanyPublic: true,
                showEmailPublic: true,
                showLocalRanking: true,
                activeTheme: null,
              };
            }

            // Build fetchedUser object
            let fetchedUser = {
              platformData: {
                ...platformData,
                user,
              },
              sources,
              verified: data.profile.verified,
              accessories: {
                badges: data.profile.bids
                  ? JSON.parse(data.profile.bids)
                  : null,
                themes: data.profile.tids
                  ? JSON.parse(data.profile.tids)
                  : null,
              },
            };

            // Update visible data
            this.setState({
              fetchedUser,
              loading: false,
            });
          }
        }
      });
  };

  updateCache = async (fetchedUser) => {
    if (fetchedUser?.platformData) {
      let platformData = fetchedUser.platformData;

      if (
        !this.state.caching &&
        this.state.loggedUser?.username === platformData.profile?.username
      ) {
        this.appendSourceObjects(fetchedUser.sources)
          .then(async () => {
            await this.intel.generateTalks(fetchedUser.sources);

            let talks = await this.getAllTalks();

            // Fix duplicates
            for (const i in talks) {
              let state = true;

              for (const i2 in platformData.talks) {
                if (talks[i].url === platformData.talks[i2].url) {
                  state = false;
                }
              }

              if (state) {
                platformData.talks.push(talks[i]);
              }
            }

            talks = platformData.talks;

            platformData = {
              ...(await this.getData()),
              user: platformData.user,
              talks,
            };

            // Override cache
            this.session.tasks.user
              .cache(JSON.stringify(platformData))
              .then(() => {
                fetchedUser.platformData = platformData;

                this.setState({
                  fetchedUser,
                  caching: true,
                });
              });
          })
          .then(() => {
            this.intel.resetReducer();
          });
      } else {
        //#WARN
        console.warn(
          "CACHING NOT ACTIVATED",
          "Caching done: " + this.state.caching
        );
      }
    }
  };

  /**
   * Save settings
   *
   * @description Saves the user settings
   */
  saveSettings = (state) => {
    // Fill platformData to be used and edited locally
    let cache = this.state.fetchedUser.platformData;

    // Check for mandatory fields
    if (state.email) {
      cache.user.firstName = state.first_name ? state.first_name : "";
      cache.user.lastName = state.last_name ? state.last_name : "";
      cache.user.email = state.email ? state.email : cache.user.email;
      cache.profile.websiteUrl = state.website ? state.website : "";
      cache.profile.location = state.location ? state.location : "";
      cache.profile.company = state.company ? state.company : "";
      cache.user.settings = {
        showTopLanguages: state.showTopLanguages,
        showLocalRanking: state.showLocalRanking,
        show3DDiagram: state.show3DDiagram,
        show2DDiagram: state.show2DDiagram,
        showEmailPublic: state.showEmailPublic,
        showCompanyPublic: state.showCompanyPublic,
        activeTheme: state.activeTheme,
      };
    }

    const platformData = JSON.stringify(cache);

    this.session.tasks.user.cache(platformData).then(({ data }) => {
      this.setState({
        fetchedUser: {
          ...this.state.fetchedUser,
          platformData: JSON.parse(platformData),
        },
      });
    });
  };

  /**
   * Get all users
   *
   * @description Retrieves a list of all users
   */
  getAllPageUrls = () => {
    return this.session.tasks.general.allPageUrls().then((res) => {
      let urls = [];

      res.data.pages &&
        res.data.pages.forEach((page) => {
          if (page.urlPath.includes("registration/")) {
            let url = page.urlPath.split("/")[2];

            urls.push(url);
          }
        });

      return urls;
    });
  };
  //#endregion

  render() {
    return (
      <ScrollToTop>
        <div className="flyout">
          {!this.state.caching &&
            this.state.fetchedUser &&
            this.state.loggedUser?.username ===
              this.state.fetchedUser.platformData.profile?.username && (
              <MDBProgress material preloader className="caching-loader" />
            )}
          <Navbar
            globalState={this.state}
            globalFunctions={{
              logout: this.logout,
              saveSettings: this.saveSettings,
              users: this.getAllPageUrls,
            }}
          />
          <main>
            <Routes
              globalState={this.state}
              globalFunctions={{
                fetchCacheData: this.fetchCacheData,
                updateCache: this.updateCache,
                uploadTalk: this.uploadTalk,
                deleteTalk: this.deleteTalk,
                getTalk: this.getTalk,
                login: this.login,
                registerUser: this.registerUser,
                fetchGitLabServers: this.fetchGitLabServers,
                refetchRequired: this.refetchRequired,
                usernameMatchesFetchedUsername: this
                  .usernameMatchesFetchedUsername,
              }}
            />
          </main>
          <Footer />
        </div>
      </ScrollToTop>
    );
  }
}
//#endregion

//#region > Exports
//> Default Class
export default withRouter(App);
//#endregion

/**
 * SPDX-License-Identifier: (EUPL-1.2)
 * Copyright © 2019-2020 Simon Prast
 */
